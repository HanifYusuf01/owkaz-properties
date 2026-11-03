import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Inquiry, InquiryStatus } from './inquiry.entity';
import { InquiryMessage } from './inquiry-message.entity';
import { User, UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CreateInquiryDto, UpdateInquiryDto, AssignInquiryDto, SendInquiryMessageDto } from './dto/inquiry.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { MailService } from '../auth/mail.service';

const GROQ_MODEL = 'openai/gpt-oss-120b';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    @InjectRepository(Inquiry)
    private inquiriesRepo: Repository<Inquiry>,
    @InjectRepository(InquiryMessage)
    private messagesRepo: Repository<InquiryMessage>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateInquiryDto, buyer: User): Promise<Inquiry> {
    const inquiry = this.inquiriesRepo.create({
      property: { id: dto.propertyId },
      buyer,
      message: dto.message,
      preferredContact: dto.preferredContact,
    });
    const saved = await this.inquiriesRepo.save(inquiry);
    const full = await this.findById(saved.id);

    await this.messagesRepo.save(
      this.messagesRepo.create({ inquiry: full, sender: buyer, message: dto.message }),
    );

    const bot = await this.usersService.getOrCreateBotUser();
    await this.messagesRepo.save(
      this.messagesRepo.create({
        inquiry: full,
        sender: bot,
        message: `Welcome to Owkaz Properties. Thanks for your interest in "${full.property?.title ?? 'this property'}". A member of our team will get back to you shortly. Feel free to ask any questions in the meantime.`,
      }),
    );

    await this.notificationsService.create({
      userId: buyer.id,
      text: `Your inquiry has been submitted. We'll get back to you shortly.`,
      type: NotificationType.INQUIRY_RECEIVED,
      relatedPropertyId: dto.propertyId,
    });

    this.sendInquiryEmails(full).catch((err) =>
      this.logger.warn(`Inquiry email pipeline failed: ${err instanceof Error ? err.message : err}`),
    );

    return full;
  }

  private async sendInquiryEmails(inquiry: Inquiry): Promise<void> {
    const propertyTitle = inquiry.property?.title ?? 'a property';
    await this.mailService.sendInquiryConfirmationToBuyer({
      to: inquiry.buyer.email,
      buyerName: inquiry.buyer.name,
      propertyTitle,
      message: inquiry.message,
    });

    const admins = await this.usersService.findAdmins();
    await Promise.all(
      admins.map((admin) =>
        this.mailService.sendNewInquiryAlertToAdmin({
          to: admin.email,
          buyerName: inquiry.buyer.name,
          buyerEmail: inquiry.buyer.email,
          propertyTitle,
          message: inquiry.message,
          inquiryId: inquiry.id,
        }),
      ),
    );
  }

  async getMessages(id: string, user: User): Promise<InquiryMessage[]> {
    const inquiry = await this.findById(id);
    if (user.role !== UserRole.ADMIN && inquiry.buyer.id !== user.id) {
      throw new ForbiddenException('Not authorized to view this conversation');
    }
    const messages = await this.messagesRepo.find({
      where: { inquiry: { id } },
      order: { createdAt: 'ASC' },
    });
    // Senders are shown by display name only; their email, phone and account fields stay private.
    return messages.map((m) => {
      const { id: senderId, name, avatarUrl, role } = m.sender;
      m.sender = { id: senderId, name, avatarUrl, role } as User;
      return m;
    });
  }

  async addMessage(id: string, user: User, dto: SendInquiryMessageDto): Promise<InquiryMessage> {
    const inquiry = await this.findById(id);
    const isBuyer = inquiry.buyer.id === user.id;
    if (user.role !== UserRole.ADMIN && !isBuyer) {
      throw new ForbiddenException('Not authorized to reply to this conversation');
    }

    const saved = await this.messagesRepo.save(
      this.messagesRepo.create({ inquiry, sender: user, message: dto.message }),
    );

    if (isBuyer) {
      if (inquiry.status === InquiryStatus.RESPONDED || inquiry.status === InquiryStatus.CLOSED) {
        await this.inquiriesRepo.update(id, { status: InquiryStatus.IN_PROGRESS });
      }
      if (inquiry.assignedTo) {
        await this.notificationsService.create({
          userId: inquiry.assignedTo.id,
          text: `${inquiry.buyer.name} replied about "${inquiry.property?.title}".`,
          type: NotificationType.INQUIRY_MESSAGE,
          relatedPropertyId: inquiry.property?.id,
        });
      } else {
        this.postAiReply(inquiry).catch((err) =>
          this.logger.warn(`AI reply pipeline failed: ${err instanceof Error ? err.message : err}`),
        );
      }
    } else {
      await this.inquiriesRepo.update(id, {
        status: InquiryStatus.RESPONDED,
        ...(inquiry.assignedTo ? {} : { assignedTo: user }),
      });
      await this.notificationsService.create({
        userId: inquiry.buyer.id,
        text: `You have a new reply about "${inquiry.property?.title}".`,
        type: NotificationType.INQUIRY_MESSAGE,
        relatedPropertyId: inquiry.property?.id,
      });
    }

    return saved;
  }

  private async postAiReply(inquiry: Inquiry): Promise<void> {
    const aiText = await this.generateAiReply(inquiry);
    if (!aiText) return;
    const bot = await this.usersService.getOrCreateBotUser();
    await this.messagesRepo.save(this.messagesRepo.create({ inquiry, sender: bot, message: aiText }));
  }

  private async generateAiReply(inquiry: Inquiry): Promise<string | null> {
    const groqKey = this.configService.get<string>('GROQ_API_KEY');
    if (!groqKey) return null;

    const p = inquiry.property;
    const propertyContext = [
      `Title: ${p.title}`,
      `Type: ${p.type}`,
      `Price: ₦${Number(p.price).toLocaleString('en-NG')}`,
      `Location: ${p.area}, ${p.lga}, ${p.state}`,
      p.beds != null ? `Bedrooms: ${p.beds}` : null,
      p.baths != null ? `Bathrooms: ${p.baths}` : null,
      p.sqm != null ? `Size: ${p.sqm} sqm` : null,
      p.amenities?.length ? `Amenities: ${p.amenities.join(', ')}` : null,
      p.description ? `Description: ${p.description}` : null,
    ].filter(Boolean).join('\n');

    const systemPrompt = `You are the Owkaz Properties assistant, answering a prospective buyer's questions about ONE listing, described below. Use only these details and never invent facts. Reply in 2 to 4 short, plain sentences. Do not use emojis, markdown, bullet points or dashes; use commas and full stops instead. For anything that needs a person to commit (final price, confirming a viewing time, contracts, payment), say a member of the Owkaz team will follow up shortly.\n\nListing details:\n${propertyContext}`;

    const history = await this.messagesRepo.find({
      where: { inquiry: { id: inquiry.id } },
      order: { createdAt: 'ASC' },
      take: 20,
    });
    const turns = history.map((m) => ({
      role: m.sender.id === inquiry.buyer.id ? ('user' as const) : ('assistant' as const),
      content: m.message,
    }));

    return this.generateViaGroq(groqKey, systemPrompt, turns);
  }

  private async generateViaGroq(
    apiKey: string,
    system: string,
    turns: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string | null> {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 300,
          messages: [{ role: 'system', content: system }, ...turns],
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Groq AI reply failed (${res.status}): ${await res.text()}`);
        return null;
      }
      const data = await res.json();
      return this.cleanReply(data.choices?.[0]?.message?.content);
    } catch (err) {
      this.logger.warn(`Groq AI reply threw: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  private cleanReply(text?: string | null): string | null {
    if (!text) return null;
    return text
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .replace(/\s+-\s+/g, ', ')
      .replace(/[*_`#]/g, '')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .trim();
  }

  async findAll(status?: InquiryStatus) {
    const query = this.inquiriesRepo
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.property', 'property')
      .leftJoinAndSelect('inquiry.buyer', 'buyer')
      .leftJoinAndSelect('inquiry.assignedTo', 'assignedTo');

    if (status) query.andWhere('inquiry.status = :status', { status });

    return query.orderBy('inquiry.createdAt', 'DESC').getMany();
  }

  async findMine(userId: string) {
    return this.inquiriesRepo.find({
      where: { buyer: { id: userId } },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiriesRepo.findOne({
      where: { id },
      relations: ['property', 'buyer', 'assignedTo'],
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  /** A conversation is visible only to the buyer who opened it and to admins. */
  async findForUser(id: string, user: User): Promise<Inquiry> {
    const inquiry = await this.findById(id);
    if (user.role !== UserRole.ADMIN && inquiry.buyer.id !== user.id) {
      throw new ForbiddenException('Not authorized to view this inquiry');
    }
    return inquiry;
  }

  async update(id: string, dto: UpdateInquiryDto, user: User): Promise<Inquiry> {
    const inquiry = await this.findById(id);
    if (user.role !== UserRole.ADMIN && inquiry.buyer.id !== user.id) {
      throw new ForbiddenException();
    }
    Object.assign(inquiry, dto);
    return this.inquiriesRepo.save(inquiry);
  }

  async assign(id: string, dto: AssignInquiryDto): Promise<Inquiry> {
    const inquiry = await this.findById(id);
    inquiry.assignedTo = { id: dto.assignedToId } as User;
    inquiry.status = InquiryStatus.IN_PROGRESS;
    const saved = await this.inquiriesRepo.save(inquiry);

    await this.notificationsService.create({
      userId: dto.assignedToId,
      text: `An inquiry for "${inquiry.property?.title}" has been assigned to you.`,
      type: NotificationType.INQUIRY_ASSIGNED,
      relatedPropertyId: inquiry.property?.id,
    });

    return saved;
  }
}

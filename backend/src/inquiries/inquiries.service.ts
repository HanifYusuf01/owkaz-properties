import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { Inquiry, InquiryStatus } from './inquiry.entity';
import { InquiryMessage } from './inquiry-message.entity';
import { User, UserRole } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CreateInquiryDto, UpdateInquiryDto, AssignInquiryDto, SendInquiryMessageDto } from './dto/inquiry.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { MailService } from '../auth/mail.service';

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
// Groq's free tier (no card required) — see https://console.groq.com/docs/rate-limits
// Model availability on Groq shifts over time; check `GET /openai/v1/models` if this ever 404s.
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
        message: `👋 Welcome to Owkaz Properties! Thanks for your interest in "${full.property?.title ?? 'this property'}". An Owkaz representative will get back to you shortly — feel free to ask any questions in the meantime.`,
      }),
    );

    await this.notificationsService.create({
      userId: buyer.id,
      text: `Your inquiry has been submitted. We'll get back to you shortly.`,
      type: NotificationType.INQUIRY_RECEIVED,
      relatedPropertyId: dto.propertyId,
    });

    // Email confirmations/alerts don't block the response — the inquiry is already saved.
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
    return this.messagesRepo.find({
      where: { inquiry: { id } },
      order: { createdAt: 'ASC' },
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
        // No human has taken over this conversation yet — let the AI assistant help out.
        // Not awaited: the buyer's own message is confirmed immediately instead of waiting
        // on the AI call, so the chat UI can show a "typing…" indicator in the meantime.
        this.postAiReply(inquiry).catch((err) =>
          this.logger.warn(`AI reply pipeline failed: ${err instanceof Error ? err.message : err}`),
        );
      }
    } else {
      // A human representative replying implicitly claims the conversation, so the AI steps back.
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
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!groqKey && !anthropicKey) return null;

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

    const systemPrompt = `You are "Owkaz Assistant", a friendly, concise support assistant for Owkaz Properties, a Nigerian real estate marketplace. You are chatting with a prospective buyer about ONE specific listing, detailed below. Answer only using these details — never invent facts you don't have. Keep replies short (2-4 sentences) and warm. For anything requiring a human commitment — final price negotiation, confirming a viewing time, contracts, payment — say a human Owkaz representative will follow up shortly rather than deciding on their behalf.\n\nListing details:\n${propertyContext}`;

    const history = await this.messagesRepo.find({
      where: { inquiry: { id: inquiry.id } },
      order: { createdAt: 'ASC' },
      take: 20,
    });
    const turns = history.map((m) => ({
      role: m.sender.id === inquiry.buyer.id ? ('user' as const) : ('assistant' as const),
      content: m.message,
    }));

    // Prefer Groq — it's genuinely free (no card required); fall back to Anthropic if configured instead.
    if (groqKey) return this.generateViaGroq(groqKey, systemPrompt, turns);
    return this.generateViaAnthropic(anthropicKey!, systemPrompt, turns);
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
      return data.choices?.[0]?.message?.content ?? null;
    } catch (err) {
      this.logger.warn(`Groq AI reply threw: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  private async generateViaAnthropic(
    apiKey: string,
    system: string,
    turns: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string | null> {
    try {
      const anthropic = new Anthropic({ apiKey });
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system,
        messages: turns,
      });
      const block = response.content.find((c) => c.type === 'text');
      return block && 'text' in block ? block.text : null;
    } catch (err) {
      this.logger.warn(`Anthropic AI reply threw: ${err instanceof Error ? err.message : err}`);
      return null;
    }
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

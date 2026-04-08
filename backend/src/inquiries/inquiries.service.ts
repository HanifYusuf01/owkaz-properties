import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry, InquiryStatus } from './inquiry.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateInquiryDto, UpdateInquiryDto, AssignInquiryDto } from './dto/inquiry.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private inquiriesRepo: Repository<Inquiry>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateInquiryDto, buyer: User): Promise<Inquiry> {
    const inquiry = this.inquiriesRepo.create({
      property: { id: dto.propertyId },
      buyer,
      message: dto.message,
      preferredContact: dto.preferredContact,
    });
    const saved = await this.inquiriesRepo.save(inquiry);

    await this.notificationsService.create({
      userId: buyer.id,
      text: `Your inquiry has been submitted. We'll get back to you shortly.`,
      type: NotificationType.INQUIRY_RECEIVED,
      relatedPropertyId: dto.propertyId,
    });

    return saved;
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

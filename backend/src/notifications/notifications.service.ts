import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

interface CreateNotificationDto {
  userId: string;
  text: string;
  type: NotificationType;
  relatedPropertyId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepo.create({
      user: { id: dto.userId },
      text: dto.text,
      type: dto.type,
      relatedPropertyId: dto.relatedPropertyId,
    });
    return this.notificationsRepo.save(notification);
  }

  async findForUser(userId: string) {
    return this.notificationsRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.notificationsRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) return null;
    notification.read = true;
    return this.notificationsRepo.save(notification);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepo.update(
      { user: { id: userId }, read: false },
      { read: true },
    );
  }
}

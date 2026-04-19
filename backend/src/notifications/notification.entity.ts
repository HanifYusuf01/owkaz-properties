import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NotificationType {
  PROPERTY_APPROVED = 'property_approved',
  PROPERTY_REJECTED = 'property_rejected',
  PROPERTY_SOLD = 'property_sold',
  INQUIRY_RECEIVED = 'inquiry_received',
  INQUIRY_ASSIGNED = 'inquiry_assigned',
  ROLE_REQUEST = 'role_request',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  text: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  relatedPropertyId: string;

  @CreateDateColumn()
  createdAt: Date;
}

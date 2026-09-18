import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Inquiry } from './inquiry.entity';

@Entity('inquiry_messages')
export class InquiryMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inquiry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: Inquiry;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}

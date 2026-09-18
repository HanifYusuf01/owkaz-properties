import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  OWNER = 'owner',
  BUYER = 'buyer',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  agency: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ default: false })
  isBot: boolean;

  @Column('uuid', { array: true, default: [] })
  savedPropertyIds: string[];

  @Column({ type: 'varchar', nullable: true })
  roleRequest: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiry: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum PropertyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
}

export enum PropertyType {
  APARTMENT = 'Apartment',
  FULLY_DETACHED = 'Fully Detached House',
  SEMI_DETACHED = 'Semi-Detached House',
  TERRACED = 'Terraced House',
  DUPLEX = 'Duplex',
  BLOCK_OF_FLATS = 'Block of Flats',
  LAND = 'Land',
  COMMERCIAL = 'Commercial',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: PropertyType })
  type: PropertyType;

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.PENDING })
  status: PropertyStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column()
  state: string;

  @Column()
  lga: string;

  @Column()
  area: string;

  @Column({ nullable: true })
  beds: number;

  @Column({ nullable: true })
  baths: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sqm: number;

  @Column('text', { array: true, default: [] })
  amenities: string[];

  @Column('text')
  description: string;

  @Column('text', { array: true, default: [] })
  images: string[];

  @Column({ type: 'varchar', nullable: true })
  panoramaUrl: string | null;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 0 })
  views: number;

  @Column({ default: false })
  isOwkaz: boolean;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salePrice: number;

  @Column({ nullable: true })
  soldAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'submitted_by_id' })
  submittedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

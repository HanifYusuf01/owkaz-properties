import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  location: string;

  @Column()
  state: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priceFrom: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priceTo: number | null;

  @Column({ default: 0 })
  totalUnits: number;

  @Column({ default: 0 })
  availableUnits: number;

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'varchar', nullable: true })
  completionDate: string | null;

  @Column({ default: 'ongoing' })
  status: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  features: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

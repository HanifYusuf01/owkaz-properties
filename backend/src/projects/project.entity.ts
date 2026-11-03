import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** One bedroom layout (or plot size) inside a project, with its own price. */
export interface UnitType {
  name: string;
  price: number;
  availableUnits?: number | null;
}

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

  @Column({ type: 'varchar', nullable: true })
  lga: string | null;

  @Column()
  state: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priceFrom: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priceTo: number | null;

  @Column({ type: 'jsonb', nullable: true })
  unitTypes: UnitType[] | null;

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

  @Column({ type: 'varchar', nullable: true })
  videoUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

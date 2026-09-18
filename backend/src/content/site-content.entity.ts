import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_content')
export class SiteContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  page: string;

  @Column({ type: 'jsonb', default: {} })
  content: Record<string, string>;

  @UpdateDateColumn()
  updatedAt: Date;
}

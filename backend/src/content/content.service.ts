import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteContent } from './site-content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(SiteContent)
    private repo: Repository<SiteContent>,
  ) {}

  async getContent(page: string): Promise<Record<string, string>> {
    const row = await this.repo.findOne({ where: { page } });
    return row?.content ?? {};
  }

  async updateContent(page: string, partial: Record<string, string>): Promise<Record<string, string>> {
    let row = await this.repo.findOne({ where: { page } });
    if (!row) {
      row = this.repo.create({ page, content: {} });
    }
    row.content = { ...row.content, ...partial };
    await this.repo.save(row);
    return row.content;
  }
}

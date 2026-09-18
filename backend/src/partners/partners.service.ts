import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from './partner.entity';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private repo: Repository<Partner>,
  ) {}

  findAll(): Promise<Partner[]> {
    return this.repo.find({ order: { order: 'ASC', createdAt: 'ASC' } });
  }

  create(dto: CreatePartnerDto): Promise<Partner> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<Partner> {
    const partner = await this.repo.findOne({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    Object.assign(partner, dto);
    return this.repo.save(partner);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Partner not found');
  }
}

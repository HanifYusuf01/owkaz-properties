import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from './hero-slide.entity';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero-slide.dto';

@Injectable()
export class HeroSlidesService {
  constructor(
    @InjectRepository(HeroSlide)
    private repo: Repository<HeroSlide>,
  ) {}

  findAll(): Promise<HeroSlide[]> {
    return this.repo.find({ order: { order: 'ASC', createdAt: 'ASC' } });
  }

  create(dto: CreateHeroSlideDto): Promise<HeroSlide> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateHeroSlideDto): Promise<HeroSlide> {
    const slide = await this.repo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Hero slide not found');
    Object.assign(slide, dto);
    return this.repo.save(slide);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Hero slide not found');
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly repo: Repository<Project>,
  ) {}

  async findAll(
    filters: { search?: string; page?: number; limit?: number } = {},
  ): Promise<{ data: Project[]; total: number; page: number; limit: number; totalPages: number }> {
    const { search } = filters;
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(filters.limit) || 12));
    const where = search
      ? [
          { name: ILike(`%${search}%`) },
          { location: ILike(`%${search}%`) },
          { state: ILike(`%${search}%`) },
        ]
      : undefined;
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async findById(id: string): Promise<Project> {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  /** When a project lists several unit types, its headline price range is worked out from them. */
  private withDerivedPrices<T extends { unitTypes?: { price: number }[]; priceFrom?: number | null; priceTo?: number | null }>(dto: T): T {
    const prices = (dto.unitTypes ?? []).map((u) => Number(u.price)).filter((n) => Number.isFinite(n));
    if (prices.length === 0) return dto;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { ...dto, priceFrom: min, priceTo: max > min ? max : null };
  }

  create(dto: CreateProjectDto): Promise<Project> {
    return this.repo.save(this.repo.create(this.withDerivedPrices(dto)));
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findById(id);
    Object.assign(project, this.withDerivedPrices(dto));
    return this.repo.save(project);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.delete(id);
  }
}

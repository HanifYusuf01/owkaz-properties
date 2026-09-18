import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Property, PropertyStatus } from './property.entity';
import { PropertyNote } from './property-note.entity';
import { User, UserRole } from '../users/user.entity';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  RejectPropertyDto,
  MarkSoldDto,
  FilterPropertiesDto,
} from './dto/property.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepo: Repository<Property>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(PropertyNote)
    private notesRepo: Repository<PropertyNote>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreatePropertyDto, user: User): Promise<Property> {
    const property = this.propertiesRepo.create({
      ...dto,
      submittedBy: user,
      status: PropertyStatus.PENDING,
    });
    return this.propertiesRepo.save(property);
  }

  async findAll(filters: FilterPropertiesDto, isPublic = false) {
    const { page = 1, limit = 12, search, type, status, state, lga, priceMin, priceMax, beds, featured } = filters;

    const query = this.propertiesRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.submittedBy', 'submittedBy');

    if (isPublic) {
      query.andWhere('property.status = :status', { status: PropertyStatus.APPROVED });
    } else if (status) {
      query.andWhere('property.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(property.title ILIKE :search OR property.area ILIKE :search OR property.lga ILIKE :search OR property.state ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) query.andWhere('property.type = :type', { type });
    if (state) query.andWhere('property.state = :state', { state });
    if (lga) query.andWhere('property.lga = :lga', { lga });
    if (priceMin) query.andWhere('property.price >= :priceMin', { priceMin });
    if (priceMax) query.andWhere('property.price <= :priceMax', { priceMax });
    if (beds) query.andWhere('property.beds >= :beds', { beds });
    if (featured !== undefined) query.andWhere('property.featured = :featured', { featured });

    query.orderBy('property.createdAt', 'DESC');

    const total = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured(): Promise<Property[]> {
    return this.propertiesRepo.find({
      where: { featured: true, status: PropertyStatus.APPROVED },
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  async findMine(userId: string, filters: FilterPropertiesDto) {
    const { page = 1, limit = 12 } = filters;
    const [data, total] = await this.propertiesRepo.findAndCount({
      where: { submittedBy: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findSold(filters: FilterPropertiesDto) {
    return this.findAll({ ...filters, status: PropertyStatus.SOLD });
  }

  async getPriceRange(status?: string): Promise<{ min: number; max: number }> {
    const targetStatus = status === 'sold' ? PropertyStatus.SOLD : PropertyStatus.APPROVED;
    const result = await this.propertiesRepo
      .createQueryBuilder('property')
      .where('property.status = :status', { status: targetStatus })
      .select('MIN(property.price)', 'min')
      .addSelect('MAX(property.price)', 'max')
      .getRawOne();

    return {
      min: result?.min != null ? Number(result.min) : 0,
      max: result?.max != null ? Number(result.max) : 0,
    };
  }

  async getStateCounts(): Promise<{ state: string; count: number }[]> {
    const rows = await this.propertiesRepo
      .createQueryBuilder('property')
      .where('property.status = :status', { status: PropertyStatus.APPROVED })
      .select('property.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('property.state')
      .getRawMany();

    return rows.map((r) => ({ state: r.state, count: Number(r.count) }));
  }

  async findById(id: string): Promise<Property> {
    const property = await this.propertiesRepo.findOne({
      where: { id },
      relations: ['submittedBy'],
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async incrementViews(id: string): Promise<void> {
    await this.propertiesRepo.increment({ id }, 'views', 1);
  }

  async update(id: string, dto: UpdatePropertyDto, user: User): Promise<Property> {
    const property = await this.findById(id);
    this.checkOwnerOrAdmin(property, user);
    // Non-admin resubmitting a rejected property: reset to PENDING for re-review
    if (user.role !== UserRole.ADMIN && property.status === PropertyStatus.REJECTED) {
      property.status = PropertyStatus.PENDING;
      property.rejectionReason = null as unknown as string;
    }
    Object.assign(property, dto);
    return this.propertiesRepo.save(property);
  }

  async approve(id: string): Promise<Property> {
    const property = await this.findById(id);
    if (property.status !== PropertyStatus.PENDING) {
      throw new BadRequestException('Property is not pending');
    }
    property.status = PropertyStatus.APPROVED;
    property.publishedAt = new Date();
    const saved = await this.propertiesRepo.save(property);

    await this.notificationsService.create({
      userId: property.submittedBy.id,
      text: `Your listing "${property.title}" has been approved and is now live.`,
      type: NotificationType.PROPERTY_APPROVED,
      relatedPropertyId: property.id,
    });

    return saved;
  }

  async reject(id: string, dto: RejectPropertyDto): Promise<Property> {
    const property = await this.findById(id);
    if (property.status !== PropertyStatus.PENDING) {
      throw new BadRequestException('Property is not pending');
    }
    property.status = PropertyStatus.REJECTED;
    property.rejectionReason = dto.rejectionReason;
    const saved = await this.propertiesRepo.save(property);

    await this.notificationsService.create({
      userId: property.submittedBy.id,
      text: `Your listing "${property.title}" was rejected. Reason: ${dto.rejectionReason}`,
      type: NotificationType.PROPERTY_REJECTED,
      relatedPropertyId: property.id,
    });

    return saved;
  }

  async markSold(id: string, dto: MarkSoldDto, user: User): Promise<Property> {
    const property = await this.findById(id);
    if (property.status !== PropertyStatus.APPROVED) {
      throw new BadRequestException('Only approved properties can be marked as sold');
    }
    this.checkOwnerOrAdmin(property, user);

    property.status = PropertyStatus.SOLD;
    property.soldAt = new Date();
    if (dto.salePrice) property.salePrice = dto.salePrice;

    const saved = await this.propertiesRepo.save(property);

    await this.notificationsService.create({
      userId: property.submittedBy.id,
      text: `Your listing "${property.title}" has been marked as sold.`,
      type: NotificationType.PROPERTY_SOLD,
      relatedPropertyId: property.id,
    });

    return saved;
  }

  async toggleFeatured(id: string): Promise<Property> {
    const property = await this.findById(id);
    property.featured = !property.featured;
    return this.propertiesRepo.save(property);
  }

  async remove(id: string, user: User): Promise<void> {
    const property = await this.findById(id);
    this.checkOwnerOrAdmin(property, user);
    await this.propertiesRepo.remove(property);
  }

  async saveProperty(propertyId: string, user: User): Promise<void> {
    await this.findById(propertyId);
    const dbUser = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException('User not found');
    if (!dbUser.savedPropertyIds.includes(propertyId)) {
      dbUser.savedPropertyIds = [...dbUser.savedPropertyIds, propertyId];
      await this.usersRepo.save(dbUser);
    }
  }

  async unsaveProperty(propertyId: string, user: User): Promise<void> {
    const dbUser = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!dbUser) throw new NotFoundException('User not found');
    dbUser.savedPropertyIds = dbUser.savedPropertyIds.filter((id) => id !== propertyId);
    await this.usersRepo.save(dbUser);
  }

  async getSavedProperties(user: User): Promise<Property[]> {
    const dbUser = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!dbUser || !dbUser.savedPropertyIds.length) return [];
    return this.propertiesRepo.find({
      where: { id: In(dbUser.savedPropertyIds) },
      relations: ['submittedBy'],
    });
  }

  async getSavedPropertyIds(user: User): Promise<string[]> {
    const dbUser = await this.usersRepo.findOne({ where: { id: user.id } });
    return dbUser?.savedPropertyIds ?? [];
  }

  async getNotes(propertyId: string, user: User): Promise<PropertyNote[]> {
    const property = await this.findById(propertyId);
    if (user.role !== UserRole.ADMIN && property.submittedBy.id !== user.id) {
      throw new ForbiddenException('Not authorized to view notes for this property');
    }
    return this.notesRepo.find({ where: { propertyId }, order: { createdAt: 'ASC' } });
  }

  async addNote(propertyId: string, user: User, content: string): Promise<PropertyNote> {
    const property = await this.findById(propertyId);
    if (user.role !== UserRole.ADMIN && property.submittedBy.id !== user.id) {
      throw new ForbiddenException('Not authorized to add notes to this property');
    }
    const note = this.notesRepo.create({ propertyId, user, content });
    return this.notesRepo.save(note);
  }

  private checkOwnerOrAdmin(property: Property, user: User): void {
    if (user.role === UserRole.ADMIN) return;
    if (property.submittedBy.id !== user.id) {
      throw new ForbiddenException('You do not have permission to modify this property');
    }
  }
}

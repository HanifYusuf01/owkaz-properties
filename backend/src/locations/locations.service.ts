import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { Property, PropertyStatus } from '../properties/property.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepo: Repository<Location>,
    @InjectRepository(Property)
    private propertiesRepo: Repository<Property>,
  ) {}

  async findAll(): Promise<(Location & { propertyCount: number })[]> {
    const locations = await this.locationsRepo.find({ order: { order: 'ASC', createdAt: 'ASC' } });

    return Promise.all(
      locations.map(async (location) => {
        const propertyCount = await this.propertiesRepo
          .createQueryBuilder('property')
          .where('property.status = :status', { status: PropertyStatus.APPROVED })
          .andWhere(
            '(property.title ILIKE :search OR property.area ILIKE :search OR property.lga ILIKE :search OR property.state ILIKE :search)',
            { search: `%${location.name}%` },
          )
          .getCount();
        return { ...location, propertyCount };
      }),
    );
  }

  create(dto: CreateLocationDto): Promise<Location> {
    return this.locationsRepo.save(this.locationsRepo.create(dto));
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const location = await this.locationsRepo.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    Object.assign(location, dto);
    return this.locationsRepo.save(location);
  }

  async remove(id: string): Promise<void> {
    const result = await this.locationsRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Location not found');
  }
}

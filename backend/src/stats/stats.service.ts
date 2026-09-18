import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Property, PropertyStatus } from '../properties/property.entity';
import { User, UserRole, UserStatus } from '../users/user.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepo: Repository<Property>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getPublicStats() {
    const [activeListings, verifiedAgents, happyClients] = await Promise.all([
      this.propertiesRepo.count({ where: { status: PropertyStatus.APPROVED } }),
      this.usersRepo.count({ where: { role: UserRole.AGENT, status: UserStatus.ACTIVE } }),
      this.usersRepo.count({ where: { role: In([UserRole.BUYER, UserRole.OWNER]), status: UserStatus.ACTIVE } }),
    ]);

    return { activeListings, verifiedAgents, happyClients };
  }
}

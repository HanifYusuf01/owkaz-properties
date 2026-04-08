import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './user.entity';
import { UpdateUserDto, UpdateUserStatusDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    agency?: string;
  }): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findAll(role?: UserRole, status?: UserStatus): Promise<User[]> {
    const query = this.usersRepo.createQueryBuilder('user');
    if (role) query.andWhere('user.role = :role', { role });
    if (status) query.andWhere('user.status = :status', { status });
    return query.orderBy('user.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async updateRefreshToken(id: string, hash: string | null): Promise<void> {
    await this.usersRepo.update(id, { refreshTokenHash: hash ?? undefined });
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    await this.usersRepo.update(id, dto);
    return this.findById(id) as Promise<User>;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.update(id, { status: dto.status });
    return this.findById(id) as Promise<User>;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.remove(user);
  }

  async setPasswordResetToken(id: string, tokenHash: string, expiry: Date): Promise<void> {
    await this.usersRepo.update(id, {
      passwordResetToken: tokenHash,
      passwordResetExpiry: expiry,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    const users = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.passwordResetToken IS NOT NULL')
      .andWhere('user.passwordResetExpiry > :now', { now: new Date() })
      .getMany();

    for (const user of users) {
      const valid = await import('bcrypt').then((bcrypt) =>
        bcrypt.compare(token, user.passwordResetToken!),
      );
      if (valid) return user;
    }
    return null;
  }

  async resetPassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepo.update(id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
      refreshTokenHash: null,
    });
  }
}

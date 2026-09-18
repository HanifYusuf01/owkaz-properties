import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './user.entity';
import { UpdateUserDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

const BOT_EMAIL = 'assistant@owkaz.ng';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  /** All non-bot admin accounts — used to fan out admin-facing notifications/emails. */
  async findAdmins(): Promise<User[]> {
    return this.usersRepo.find({ where: { role: UserRole.ADMIN, isBot: false } });
  }

  /** The "Owkaz Assistant" system account used to post automated welcome/AI chat replies. */
  async getOrCreateBotUser(): Promise<User> {
    const existing = await this.usersRepo.findOne({ where: { isBot: true } });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const bot = this.usersRepo.create({
      name: 'Owkaz Assistant',
      email: BOT_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isBot: true,
    });
    return this.usersRepo.save(bot);
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    agency?: string;
    status?: UserStatus;
  }): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findAll(
    filters: { role?: UserRole; status?: UserStatus; page?: number; limit?: number } = {},
  ): Promise<{ data: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const { role, status, page = 1, limit = 20 } = filters;
    const query = this.usersRepo.createQueryBuilder('user');
    if (role) query.andWhere('user.role = :role', { role });
    if (status) query.andWhere('user.status = :status', { status });
    const total = await query.getCount();
    const data = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
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

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.update(id, { role: dto.role });
    return this.findById(id) as Promise<User>;
  }

  async requestRole(user: User, requestedRole: 'agent' | 'owner'): Promise<{ message: string }> {
    // Save request on user record
    await this.usersRepo.update(user.id, { roleRequest: requestedRole });

    // Notify all admins
    const admins = await this.usersRepo.find({ where: { role: UserRole.ADMIN } });
    await Promise.all(
      admins.map((admin) =>
        this.notificationsService.create({
          userId: admin.id,
          text: `${user.name} (${user.email}) has requested to become an ${requestedRole}. Review in User Management.`,
          type: NotificationType.ROLE_REQUEST,
        }),
      ),
    );

    return { message: 'Role request submitted. An admin will review your request.' };
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

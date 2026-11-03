import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { MailService } from './mail.service';
import { UserRole, UserStatus } from '../users/user.entity';

const DUMMY_HASH = bcrypt.hashSync('owkaz-timing-equaliser', 10);
const hashResetToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (dto.role === UserRole.AGENT) {
      await this.usersService.create({ ...dto, passwordHash, status: UserStatus.PENDING });
      return { pending: true, message: 'Your account is pending admin approval. You will be notified once approved.' };
    }

    const user = await this.usersService.create({ ...dto, passwordHash });
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Compare against a dummy hash when the account doesn't exist so response time doesn't reveal which emails are registered.
    const valid = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is pending admin approval.');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Your account has been suspended. Please contact support.');
    }

    const tokens = await this.generateTokens(user);
    const { passwordHash, refreshTokenHash, passwordResetToken, passwordResetExpiry, ...publicUser } = user as any;
    return { ...tokens, user: publicUser };
  }

  async googleAuth(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google sign-in is not configured on this server.');
    }

    let payload: { email?: string; name?: string; email_verified?: boolean } | undefined;
    try {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload?.email) throw new UnauthorizedException('Google account has no email');
    if (!payload.email_verified) throw new UnauthorizedException('Google account email is not verified');

    const email = payload.email.trim().toLowerCase();
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = await this.usersService.create({
        name: payload.name ?? email.split('@')[0],
        email,
        passwordHash,
        role: UserRole.BUYER,
      });
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is pending admin approval.');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Your account has been suspended. Please contact support.');
    }

    const tokens = await this.generateTokens(user);
    const { passwordHash, refreshTokenHash, passwordResetToken, passwordResetExpiry, ...publicUser } = user as any;
    return { ...tokens, user: publicUser };
  }

  async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException();

    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account suspended');
    if (user.status === UserStatus.PENDING) throw new UnauthorizedException('Account pending approval');

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    // High-entropy random token, so a plain SHA-256 is enough and lets us look the user up directly.
    const tokenHash = hashResetToken(token);

    await this.usersService.setPasswordResetToken(user.id, tokenHash, expiry);
    await this.mailService.sendPasswordReset(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.usersService.findByResetToken(hashResetToken(dto.token));
    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersService.resetPassword(user.id, passwordHash);
  }
}

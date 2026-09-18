import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../users/user.entity';

const REGISTERABLE_ROLES = [
  UserRole.BUYER,
  UserRole.AGENT,
  UserRole.OWNER,
] as const;
type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: REGISTERABLE_ROLES, default: UserRole.BUYER })
  @IsEnum(REGISTERABLE_ROLES)
  role: RegisterableRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agency?: string;
}

export class GoogleAuthDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

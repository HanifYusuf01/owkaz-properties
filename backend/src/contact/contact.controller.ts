import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from '../auth/dto/auth.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MailService } from '../auth/mail.service';

export class ContactDto {
  @ApiProperty() @IsString() @MaxLength(80) firstName: string;
  @ApiProperty() @IsString() @MaxLength(80) lastName: string;
  @ApiProperty() @Transform(normalizeEmail) @IsEmail() @MaxLength(254) email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) subject?: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(5000) message: string;
}

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: ContactDto) {
    await this.mailService.sendContactMessage(dto);
    return { message: 'Message sent successfully' };
  }
}

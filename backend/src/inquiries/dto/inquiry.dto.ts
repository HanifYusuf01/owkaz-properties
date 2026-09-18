import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus, PreferredContact } from '../inquiry.entity';

export class CreateInquiryDto {
  @ApiProperty()
  @IsUUID()
  propertyId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ enum: PreferredContact })
  @IsEnum(PreferredContact)
  preferredContact: PreferredContact;
}

export class UpdateInquiryDto {
  @ApiPropertyOptional({ enum: InquiryStatus })
  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  internalNotes?: string;
}

export class AssignInquiryDto {
  @ApiProperty()
  @IsUUID()
  assignedToId: string;
}

export class SendInquiryMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;
}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export const PROJECT_STATUSES = ['ongoing', 'completed', 'pre-launch', 'selling-fast', 'new-launch'] as const;

export class CreateProjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() location: string;
  @ApiProperty() @IsString() state: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() priceFrom?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() priceTo?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalUnits?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) availableUnits?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) progress?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() completionDate?: string;

  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional() @IsIn(PROJECT_STATUSES) status?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() images?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() features?: string[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsInt,
  IsNotEmpty,
  ArrayMaxSize,
  MaxLength,
  Min,
  Max,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const PROJECT_STATUSES = ['ongoing', 'completed', 'pre-launch', 'selling-fast', 'new-launch'] as const;

export class UnitTypeDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(80) name: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) availableUnits?: number | null;
}

export class CreateProjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() location: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lga?: string;
  @ApiProperty() @IsString() state: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() priceFrom?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() priceTo?: number;

  @ApiPropertyOptional({ type: [UnitTypeDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => UnitTypeDto)
  unitTypes?: UnitTypeDto[];

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) totalUnits?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) availableUnits?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) progress?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() completionDate?: string;

  @ApiPropertyOptional({ enum: PROJECT_STATUSES })
  @IsOptional() @IsIn(PROJECT_STATUSES) status?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() images?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() features?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() videoUrl?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

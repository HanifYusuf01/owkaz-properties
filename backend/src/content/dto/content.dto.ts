import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContentDto {
  @ApiProperty({ type: Object, description: 'Partial map of content keys to text values' })
  @IsObject()
  content: Record<string, string>;
}

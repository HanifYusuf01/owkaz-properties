import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './location.entity';
import { Property } from '../properties/property.entity';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Property])],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}

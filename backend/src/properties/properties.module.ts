import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property } from './property.entity';
import { PropertyNote } from './property-note.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, User, PropertyNote]), NotificationsModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}

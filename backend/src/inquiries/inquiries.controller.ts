import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryDto, AssignInquiryDto, SendInquiryMessageDto } from './dto/inquiry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';
import { InquiryStatus } from './inquiry.entity';

@ApiTags('Inquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.BUYER)
  create(@Body() dto: CreateInquiryDto, @CurrentUser() user: User) {
    return this.inquiriesService.create(dto, user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('status') status?: InquiryStatus) {
    return this.inquiriesService.findAll(status);
  }

  @Get('mine')
  findMine(@CurrentUser() user: User) {
    return this.inquiriesService.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto, @CurrentUser() user: User) {
    return this.inquiriesService.update(id, dto, user);
  }

  @Patch(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  assign(@Param('id') id: string, @Body() dto: AssignInquiryDto) {
    return this.inquiriesService.assign(id, dto);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @CurrentUser() user: User) {
    return this.inquiriesService.getMessages(id, user);
  }

  @Post(':id/messages')
  addMessage(@Param('id') id: string, @Body() dto: SendInquiryMessageDto, @CurrentUser() user: User) {
    return this.inquiriesService.addMessage(id, user, dto);
  }
}

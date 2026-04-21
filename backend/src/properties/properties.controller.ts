import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  RejectPropertyDto,
  MarkSoldDto,
  FilterPropertiesDto,
} from './dto/property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // ── Public endpoints ──

  @Get()
  findAll(@Query() filters: FilterPropertiesDto) {
    return this.propertiesService.findAll(filters, true);
  }

  @Get('featured')
  findFeatured() {
    return this.propertiesService.findFeatured();
  }

  @Get('sold')
  findSoldPublic(@Query() filters: FilterPropertiesDto) {
    return this.propertiesService.findSold(filters);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('saved')
  getSaved(@CurrentUser() user: User) {
    return this.propertiesService.getSavedProperties(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('saved/ids')
  getSavedIds(@CurrentUser() user: User) {
    return this.propertiesService.getSavedPropertyIds(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.propertiesService.incrementViews(id);
    return this.propertiesService.findById(id);
  }

  // ── Protected endpoints ──

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  findAllAdmin(@Query() filters: FilterPropertiesDto) {
    return this.propertiesService.findAll(filters, false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/sold')
  findSold(@Query() filters: FilterPropertiesDto) {
    return this.propertiesService.findSold(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Get('my/listings')
  findMine(@CurrentUser() user: User, @Query() filters: FilterPropertiesDto) {
    return this.propertiesService.findMine(user.id, filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User) {
    return this.propertiesService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.propertiesService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectPropertyDto) {
    return this.propertiesService.reject(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Patch(':id/sold')
  markSold(
    @Param('id') id: string,
    @Body() dto: MarkSoldDto,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.markSold(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/feature')
  toggleFeatured(@Param('id') id: string) {
    return this.propertiesService.toggleFeatured(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/save')
  saveProperty(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.saveProperty(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/save')
  unsaveProperty(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.unsaveProperty(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.remove(id, user);
  }

  // ── Property Notes ──

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Get(':id/notes')
  getNotes(@Param('id') id: string, @CurrentUser() user: User) {
    return this.propertiesService.getNotes(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.AGENT, UserRole.OWNER, UserRole.ADMIN)
  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.propertiesService.addNote(id, user, content);
  }
}

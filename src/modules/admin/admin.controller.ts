import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enum/roles.enum';
import { CreateAuthorAdminDto } from './dto/create-author-admin.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('authors')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create an author account (ADMIN only)' })
  async createAuthor(@Body() dto: CreateAuthorAdminDto) {
    return this.adminService.createAuthor(dto);
  }
}

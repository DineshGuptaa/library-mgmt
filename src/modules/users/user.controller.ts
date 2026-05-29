import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UsersService } from './service/users.service';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserById(id);
    return {
      success: true,
      message: 'User fetched successfully',
      data: user,
    };
  }
}

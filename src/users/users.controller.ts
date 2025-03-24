import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetRoleDto } from './dto/set-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin, Role.SuperAdmin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me/roles')
  getUserRoles(@Request() req) {
    return this.usersService.getCurrentUserRoles(req.user.id);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneId(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // Prevent non-SuperAdmin users from modifying SuperAdmin or Admin users
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  async remove(@Param('id') id: string, @Request() req) {
    const targetUser = await this.usersService.findOneId(+id);
    const currentUser = await this.usersService.findOneId(req.user.id);

    // Prevent deleting SuperAdmin users
    if (targetUser.role === Role.SuperAdmin) {
      throw new ForbiddenException('SuperAdmin users cannot be deleted');
    }

    // Only SuperAdmin can delete Admin users
    if (
      targetUser.role === Role.Admin &&
      currentUser.role !== Role.SuperAdmin
    ) {
      throw new ForbiddenException('Only SuperAdmin can delete Admin users');
    }

    return this.usersService.remove(+id);
  }

  // Role management endpoints

  @Patch(':id/role')
  @Roles(Role.SuperAdmin)
  setUserRole(
    @Param('id') id: string,
    @Body() setRoleDto: SetRoleDto,
    @Request() req,
  ) {
    return this.usersService.setUserRole(req.user.id, +id, setRoleDto.role);
  }

  @Delete(':id/admin-role')
  @Roles(Role.SuperAdmin)
  removeAdminRole(@Param('id') id: string, @Request() req) {
    return this.usersService.removeAdminRole(req.user.id, +id);
  }
}

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
  ParseIntPipe,
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneId(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const targetUser = await this.usersService.findOneId(id);
    const currentUser = await this.usersService.findOneId(req.user.id);

    if (
      targetUser.role === Role.SuperAdmin ||
      (targetUser.role === Role.Admin && currentUser.role !== Role.SuperAdmin)
    ) {
      throw new ForbiddenException('无权修改超级管理员或管理员用户');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const targetUser = await this.usersService.findOneId(id);
    const currentUser = await this.usersService.findOneId(req.user.id);

    if (targetUser.role === Role.SuperAdmin) {
      throw new ForbiddenException('无法删除超级管理员用户');
    }
    if (
      targetUser.role === Role.Admin &&
      currentUser.role !== Role.SuperAdmin
    ) {
      throw new ForbiddenException('只有超级管理员可以删除管理员用户');
    }

    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  @Roles(Role.SuperAdmin)
  setUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() setRoleDto: SetRoleDto,
    @Request() req,
  ) {
    return this.usersService.setUserRole(req.user.id, id, setRoleDto.role);
  }

  @Delete(':id/admin-role')
  @Roles(Role.SuperAdmin)
  removeAdminRole(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usersService.removeAdminRole(req.user.id, id);
  }
}

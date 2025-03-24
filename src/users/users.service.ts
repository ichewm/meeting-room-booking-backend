import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/auth/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username: username },
    });
    if (!user) {
      throw new NotFoundException(`User with username: ${username} not found`);
    }
    return user;
  }

  async findOneId(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Hash the password before creating the user
    const saltOrRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    // Create user with hashed password
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // If password is included in the update, hash it
    if (updateUserDto.password) {
      const saltOrRounds = 12;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltOrRounds,
      );
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOneId(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
  /**
   * 获取当前用户的角色和权限
   * @param userId 用户ID
   * @returns 包含角色和权限的对象
   */
  async getCurrentUserRoles(userId: number) {
    const user = await this.findOneId(userId);
    return {
      role: user.role,
      permissions: {
        canManageAdmins: user.role === Role.SuperAdmin,
        canManageUsers:
          user.role === Role.SuperAdmin || user.role === Role.Admin,
      },
    };
  }

  /**
   * 设置用户角色
   * @param currentUserId 当前操作用户ID
   * @param targetUserId 目标用户ID
   * @param newRole 新角色
   * @returns 更新后的用户对象
   */
  async setUserRole(
    currentUserId: number,
    targetUserId: number,
    newRole: Role,
  ): Promise<User> {
    // 获取当前用户以检查权限
    const currentUser = await this.findOneId(currentUserId);

    // 获取目标用户以更新
    const targetUser = await this.findOneId(targetUserId);

    // 基于角色层级检查权限
    if (currentUser.role !== Role.SuperAdmin && newRole === Role.SuperAdmin) {
      throw new ForbiddenException('只有超级管理员可以分配超级管理员角色');
    }

    if (
      currentUser.role !== Role.SuperAdmin &&
      targetUser.role === Role.SuperAdmin
    ) {
      throw new ForbiddenException('超级管理员角色不能被其他用户修改');
    }

    if (
      currentUser.role !== Role.SuperAdmin &&
      targetUser.role === Role.Admin
    ) {
      throw new ForbiddenException('管理员角色只能由超级管理员修改');
    }

    if (currentUser.role === Role.Admin && newRole === Role.Admin) {
      throw new ForbiddenException('管理员用户不能创建其他管理员用户');
    }

    // 更新用户角色
    targetUser.role = newRole;
    return this.usersRepository.save(targetUser);
  }

  /**
   * 移除管理员角色
   * @param currentUserId 当前操作用户ID
   * @param targetUserId 目标用户ID
   * @returns 更新后的用户对象
   */
  async removeAdminRole(
    currentUserId: number,
    targetUserId: number,
  ): Promise<User> {
    // 获取当前用户以检查权限
    const currentUser = await this.findOneId(currentUserId);

    // 获取目标用户以更新
    const targetUser = await this.findOneId(targetUserId);

    // 检查目标用户是否为管理员
    if (targetUser.role !== Role.Admin) {
      throw new ForbiddenException('目标用户不是管理员');
    }

    // 基于角色层级检查权限
    if (currentUser.role !== Role.SuperAdmin) {
      throw new ForbiddenException('只有超级管理员可以移除管理员角色');
    }

    // 将用户角色更新为普通员工
    targetUser.role = Role.Employee;
    return this.usersRepository.save(targetUser);
  }
}

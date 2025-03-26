import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/auth/enums/role.enum';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly saltOrRounds: number;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.saltOrRounds = this.configService.get<number>(
      'BCRYPT_SALT_ROUNDS',
      12,
    );
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`未找到用户 ${username}`);
    }
    return user;
  }

  async findOneId(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`未找到 ID 为 ${id} 的用户`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;
    if (await this.usersRepository.findOne({ where: { username } })) {
      throw new BadRequestException(`用户名 ${username} 已存在`);
    }
    if (await this.usersRepository.findOne({ where: { email } })) {
      throw new BadRequestException(`邮箱 ${email} 已存在`);
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.saltOrRounds,
    );
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`创建用户 ${username} 成功, ID: ${savedUser.id}`);
    return savedUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneId(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      if (
        await this.usersRepository.findOne({
          where: { username: updateUserDto.username },
        })
      ) {
        throw new BadRequestException(
          `用户名 ${updateUserDto.username} 已存在`,
        );
      }
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      if (
        await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        })
      ) {
        throw new BadRequestException(`邮箱 ${updateUserDto.email} 已存在`);
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        this.saltOrRounds,
      );
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(`更新用户 ${user.username} 成功, ID: ${id}`);
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOneId(id);
    await this.usersRepository.delete(id);
    this.logger.log(`删除用户 ${user.username} 成功, ID: ${id}`);
  }

  async getCurrentUserRoles(userId: number) {
    const user = await this.findOneId(userId);
    return {
      role: user.role,
      permissions: {
        canManageAdmins: user.role === Role.SuperAdmin,
        canManageUsers: [Role.SuperAdmin, Role.Admin].includes(user.role),
      },
    };
  }

  async setUserRole(
    currentUserId: number,
    targetUserId: number,
    newRole: Role,
  ): Promise<User> {
    const currentUser = await this.findOneId(currentUserId);
    const targetUser = await this.findOneId(targetUserId);

    // 统一权限检查
    if (currentUser.role !== Role.SuperAdmin) {
      if (
        newRole === Role.SuperAdmin ||
        targetUser.role === Role.SuperAdmin ||
        targetUser.role === Role.Admin
      ) {
        throw new ForbiddenException(
          '只有超级管理员可以修改超级管理员或管理员角色',
        );
      }
      if (newRole === Role.Admin) {
        throw new ForbiddenException('管理员不能创建其他管理员');
      }
    }

    targetUser.role = newRole;
    const updatedUser = await this.usersRepository.save(targetUser);
    this.logger.log(
      `用户 ${currentUser.username} 将 ${targetUser.username} 角色设置为 ${newRole}`,
    );
    return updatedUser;
  }

  async removeAdminRole(
    currentUserId: number,
    targetUserId: number,
  ): Promise<User> {
    const currentUser = await this.findOneId(currentUserId);
    const targetUser = await this.findOneId(targetUserId);

    if (targetUser.role !== Role.Admin) {
      throw new BadRequestException('目标用户不是管理员');
    }
    if (currentUser.role !== Role.SuperAdmin) {
      throw new ForbiddenException('只有超级管理员可以移除管理员角色');
    }

    targetUser.role = Role.Employee;
    const updatedUser = await this.usersRepository.save(targetUser);
    this.logger.log(
      `用户 ${currentUser.username} 移除 ${targetUser.username} 的管理员角色`,
    );
    return updatedUser;
  }
}

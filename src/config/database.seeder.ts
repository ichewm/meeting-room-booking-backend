import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/enums/role.enum';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    try {
      // Check if SuperAdmin already exists
      const existingSuperAdmin = await this.usersRepository.findOneBy({
        role: Role.SuperAdmin,
      });

      if (existingSuperAdmin) {
        this.logger.log('SuperAdmin user already exists');
        return;
      }

      // Get credentials from environment variables or use defaults
      const username = this.configService.get<string>(
        'SUPER_ADMIN_USERNAME',
        'superadmin',
      );
      const email = this.configService.get<string>(
        'SUPER_ADMIN_EMAIL',
        'superadmin@example.com',
      );
      const rawPassword = this.configService.get<string>(
        'SUPER_ADMIN_PASSWORD',
      );
      if (!rawPassword) {
        throw new Error(
          'SUPER_ADMIN_PASSWORD 未在环境变量中配置，请设置一个安全的密码',
        );
      }

      // Hash the password
      const saltOrRounds = parseInt(
        this.configService.get<string>('BCRYPT_SALT_ROUNDS', '12'),
        12,
      );
      const password = await bcrypt.hash(rawPassword, saltOrRounds);

      // Create the SuperAdmin user
      const superAdmin = this.usersRepository.create({
        username,
        email,
        password,
        role: Role.SuperAdmin,
      });

      await this.usersRepository.save(superAdmin);
      this.logger.log('SuperAdmin user has been created successfully');
    } catch (error) {
      this.logger.error('Failed to seed SuperAdmin user', error.stack);
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw new Error('创建超级管理员用户失败: ' + error.message);
      }
    }
  }
}

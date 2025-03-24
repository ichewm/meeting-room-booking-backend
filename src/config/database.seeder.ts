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
      const existingSuperAdmin = await this.usersRepository.findOne({
        where: { role: Role.SuperAdmin },
      });

      if (existingSuperAdmin) {
        this.logger.log('SuperAdmin user already exists');
        return;
      }

      // Get credentials from environment variables or use defaults
      const username = this.configService.get(
        'SUPER_ADMIN_USERNAME',
        'superadmin',
      );
      const email = this.configService.get(
        'SUPER_ADMIN_EMAIL',
        'superadmin@example.com',
      );
      const rawPassword = this.configService.get(
        'SUPER_ADMIN_PASSWORD',
        'SuperAdmin123!',
      );

      // Hash the password
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(rawPassword, salt);

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
    }
  }
}

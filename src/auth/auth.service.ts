import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      this.logger.warn(`用户 ${username} 不存在`);
      return null;
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      this.logger.warn(`用户 ${username} 密码错误`);
      return null;
    }
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role, // 添加用户角色到 payload
    };
    this.logger.log(`用户 ${user.username} 登录成功`);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDto: CreateUserDto): Promise<any> {
    const existingUser = await this.usersService.findOne(userDto.username);
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }
    const saltOrRounds = this.configService.get<number>(
      'BCRYPT_SALT_ROUNDS',
      12,
    );
    const hash = await bcrypt.hash(userDto.password, saltOrRounds);
    const newUser = await this.usersService.create({
      ...userDto,
      password: hash,
    });
    this.logger.log(`用户 ${newUser.username} 注册成功`);
    return newUser;
  }
}

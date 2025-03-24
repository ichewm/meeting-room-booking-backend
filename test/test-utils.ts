import { JwtService } from '@nestjs/jwt';
import { Role } from '../src/auth/enums/role.enum';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

/**
 * 生成一个测试用的 JWT 令牌
 */
export function generateTestToken(
  user: Partial<User>,
  jwtService: JwtService,
): string {
  const payload = {
    username: user.username,
    sub: user.id,
    role: user.role,
  };
  return jwtService.sign(payload);
}

/**
 * 创建一个测试用户
 */
export async function createTestUser(
  userRepository: Repository<User>,
  userData: Partial<User> = {},
): Promise<User> {
  // 默认用户数据
  const defaultUser = {
    username: `testuser-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    role: Role.Employee,
    password: await bcrypt.hash('password123', 10),
  };

  // 合并默认数据和提供的数据
  const newUser = userRepository.create({
    ...defaultUser,
    ...userData,
  });

  return userRepository.save(newUser);
}

/**
 * 创建一个管理员测试用户
 */
export async function createAdminUser(
  userRepository: Repository<User>,
): Promise<User> {
  return createTestUser(userRepository, { role: Role.Admin });
}

/**
 * 比较日期是否相同（忽略毫秒差异）
 */
export function datesAreEqual(date1: Date, date2: Date): boolean {
  return Math.abs(date1.getTime() - date2.getTime()) < 1000;
}

/**
 * 模拟 HTTP 请求对象
 */
export function mockRequest(user?: Partial<User>): any {
  return {
    user,
  };
}

/**
 * 模拟数据库事务
 */
export function mockTransaction<T>(callback: () => Promise<T>): Promise<T> {
  return callback();
}

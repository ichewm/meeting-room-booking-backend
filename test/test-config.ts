import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { MeetingRoom } from '../src/meeting-rooms/entities/meeting-room.entity';
import { Reservation } from '../src/reservations/entities/reservation.entity';
import * as path from 'path';
import * as fs from 'fs';

// SQLite 数据库文件路径
const dbPath = path.resolve(__dirname, '../test.sqlite');

// 创建测试数据库配置
export const testDbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:', // 使用内存数据库，无需显式清理
  entities: [User, MeetingRoom, Reservation],
  synchronize: true, // 自动同步实体
  dropSchema: true, // 每次连接前删除模式
  logging: false,
};

// 基于文件的 SQLite 数据库配置（如果需要持久化测试数据）
export const testDbFileConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: dbPath,
  entities: [User, MeetingRoom, Reservation],
  synchronize: true,
  dropSchema: true,
  logging: false,
};

// 删除测试数据库文件
export function cleanupTestDatabase(): void {
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Removed test database file');
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
}

// 创建具有测试配置的测试模块选项
export const testModuleConfig = {
  imports: [],
  providers: [],
};

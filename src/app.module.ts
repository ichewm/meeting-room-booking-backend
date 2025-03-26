import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MeetingRoomsModule } from './meeting-rooms/meeting-rooms.module';
import { ReservationsModule } from './reservations/reservations.module';
import { User } from './users/entities/user.entity';
import { MeetingRoom } from './meeting-rooms/entities/meeting-room.entity';
import { Reservation } from './reservations/entities/reservation.entity';
import { configValidationSchema } from './config/config.validation';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Reflector } from '@nestjs/core';
import { DatabaseSeeder } from './config/database.seeder';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: true },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        return {
          type: 'mysql',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [User, MeetingRoom, Reservation],
          synchronize: nodeEnv === 'development', // 仅开发环境同步
          migrations: ['dist/migrations/*.js'], // 使用迁移文件
          migrationsRun: nodeEnv === 'production', // 生产环境自动运行迁移
          logging: nodeEnv === 'development',
          ssl: nodeEnv === 'production' ? { rejectUnauthorized: true } : false, // 生产环境强制证书验证
        };
      },
    }),
    TypeOrmModule.forFeature([User]), // 为 DatabaseSeeder 提供 UserRepository
    UsersModule,
    AuthModule,
    MeetingRoomsModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    DatabaseSeeder,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    Logger, // 添加全局日志服务
  ],
})
export class AppModule {}

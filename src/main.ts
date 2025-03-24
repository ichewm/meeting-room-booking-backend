import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // 使用 Helmet 提高常见安全防护
  app.use(helmet());

  // 添加全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 剥离未经验证的属性
      forbidNonWhitelisted: true, // 对未知属性抛出错误
      transform: true, // 启用输入数据的自动转换
    }),
  );

  // 配置 CORS
  if (nodeEnv === 'development') {
    app.enableCors(); // 开发环境允许所有来源
  } else {
    app.enableCors({
      origin: configService.get<string>('ALLOWED_ORIGINS', '').split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });
  }

  // 设置全局前缀
  app.setGlobalPrefix('api');

  await app.listen(port);
  logger.log(`Application running on port ${port} in ${nodeEnv} mode`);
}
bootstrap();

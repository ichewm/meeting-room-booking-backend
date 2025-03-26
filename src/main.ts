import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // 新增异常过滤器

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log'] // 生产环境减少日志
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // 自定义 Helmet 配置
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? true : false, // 生产环境启用 CSP
      hsts: { maxAge: 31536000, includeSubDomains: true }, // 强制 HTTPS
      frameguard: { action: 'deny' }, // 防止点击劫持
    }),
  );

  // 添加全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 添加全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置 CORS
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',');
  if (nodeEnv === 'development') {
    app.enableCors({
      origin: ['http://localhost:3000'], // 默认开发环境来源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });
  } else {
    if (
      !allowedOrigins ||
      allowedOrigins.length === 0 ||
      allowedOrigins[0] === ''
    ) {
      logger.warn('未配置 ALLOWED_ORIGINS, 使用默认值');
      allowedOrigins[0] = 'https://your-production-domain.com'; // 替换为实际域名
    }
    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });
  }

  // 设置全局前缀
  app.setGlobalPrefix('api');

  await app.listen(port);
  logger.log(`应用运行在 ${port} 端口, 环境: ${nodeEnv}`);
}
bootstrap();

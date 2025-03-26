import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('运行环境, 可选值: development, production, test'),
  PORT: Joi.number().default(3000).description('服务监听端口，默认 3000'),
  DB_HOST: Joi.string()
    .default('localhost')
    .description('数据库主机地址，默认 localhost'),
  DB_PORT: Joi.number()
    .default(3306)
    .description('数据库端口，默认 3306(MySQL 默认端口)'),
  DB_USERNAME: Joi.string().required().description('数据库用户名，必填'),
  DB_PASSWORD: Joi.string().required().description('数据库密码，必填'),
  DB_DATABASE: Joi.string().required().description('数据库名称，必填'),
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .description('JWT 密钥，至少 32 个字符，建议使用随机生成的安全密钥'),
  JWT_EXPIRATION: Joi.string()
    .default('60m')
    .description('JWT 令牌过期时间，例如 60m(60分钟)、1d(1天)'),
  ALLOWED_ORIGINS: Joi.string()
    .default('http://localhost:3000') // 默认只允许本地开发环境
    .description(
      '逗号分隔的允许跨域来源列表，例如 http://example.com,https://api.example.com',
    ),
});

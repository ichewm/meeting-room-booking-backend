# 会议室预订系统 - 项目启动指南

本文档提供了如何在本地环境中设置和运行会议室预订系统后端的详细指南。

## 目录
- [前置条件](#前置条件)
- [项目环境设置](#项目环境设置)
- [数据库初始化](#数据库初始化)
- [启动项目](#启动项目)
- [常见问题](#常见问题)

## 前置条件

在开始之前，请确保您的本地环境中已安装以下软件：

- Node.js (v14.x 或更高版本)
- Yarn (v1.22.x 或更高版本)
- MySQL (v8.0 或更高版本)
- Git

## 项目环境设置

### 1. 克隆项目仓库

```bash
git clone <项目仓库地址>
cd meeting-room-booking-backend
```

### 2. 安装依赖

```bash
yarn install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件，参考以下模板：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=conference_room_db

# JWT配置
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRATION=60m

# 允许的跨域来源
ALLOWED_ORIGINS=*
```

> ⚠️ **安全提示**：
> - 在生产环境中，使用强随机字符串作为 JWT_SECRET
> - 不要将 .env 文件提交到版本控制系统
> - 生产环境中限制 ALLOWED_ORIGINS 为特定域名

## 数据库初始化

### 方式一：本地 MySQL 手动设置

1. 使用 MySQL 命令行或图形界面工具（如 MySQL Workbench）创建数据库：

```sql
CREATE DATABASE conference_room_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 确保在 `.env` 文件中配置了正确的数据库连接信息。

3. 启动应用程序，系统将自动创建表结构（仅在开发环境中）：

```bash
yarn start:dev
```

> 注意：在 `development` 环境中，TypeORM 的 `synchronize` 选项设置为 `true`，会自动同步实体到数据库。**不要在生产环境中使用此选项**。

### 方式二：使用 Docker 初始化

1. 创建 `/init-scripts` 目录，添加 `init.sql` 文件：

```bash
mkdir -p init-scripts
```

2. 在 `init-scripts/init.sql` 添加初始化脚本：

```sql
CREATE DATABASE IF NOT EXISTS conference_room_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE conference_room_db;

-- 如需添加初始数据，可以在此处添加 INSERT 语句
```

3. 使用 Docker Compose 启动数据库：

```bash
docker-compose up -d db
```

## 启动项目

### 方式一：本地开发模式

```bash
# 开发模式（支持热重载）
yarn start:dev

# 或生产模式
yarn build
yarn start
```

### 方式二：使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 仅启动数据库（然后使用本地开发模式启动应用）
docker-compose up -d db
```

## 初始化测试数据

对于开发环境，您可能需要初始化一些测试数据。以下是一个手动执行的示例：

1. 访问 `/api/auth/register` 注册管理员账户：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "email": "admin@example.com"
  }'
```

2. 修改用户角色为管理员（使用数据库查询）：

```sql
UPDATE user SET role = 'admin' WHERE username = 'admin';
```

## 常见问题

### 1. 数据库连接错误

**问题**: 应用无法连接到数据库

**解决方案**:
- 确认 MySQL 服务正在运行
- 验证 `.env` 文件中的数据库凭据是否正确
- 检查 MySQL 用户是否有足够的权限
- 确保防火墙未阻止数据库连接

```bash
# 检查 MySQL 服务状态
sudo systemctl status mysql

# 测试数据库连接
mysql -u your_username -p -h localhost conference_room_db
```

### 2. TypeORM 实体同步问题

**问题**: 数据库表结构与实体定义不匹配

**解决方案**:
- 开发环境中，确保 `synchronize: true` 已设置
- 生产环境中，使用迁移而不是自动同步
- 如有重大模式更改，考虑手动调整数据库或使用清洁数据库重新开始

### 3. JWT 认证问题

**问题**: 令牌验证失败或权限问题

**解决方案**:
- 确保 `.env` 文件中设置了 `JWT_SECRET`
- 检查令牌是否已过期（默认为 60 分钟）
- 验证用户角色是否正确设置
- 清除浏览器缓存和存储的令牌

## 部署注意事项

准备将应用部署到生产环境时，请注意以下几点：

1. **禁用自动同步**: 将 TypeORM 配置中的 `synchronize` 设置为 `false`，使用迁移来管理数据库架构变更。

2. **安全环境变量**: 使用环境变量管理系统或密钥管理服务来存储敏感信息，而不是 `.env` 文件。

3. **CORS 配置**: 限制 `ALLOWED_ORIGINS` 为您的前端应用域名。

4. **数据库安全**: 使用强密码，限制数据库访问，考虑使用 SSL 连接。

5. **日志管理**: 设置适当的日志级别和日志存储策略。
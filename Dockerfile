# 构建阶段
FROM node:18-alpine AS build

WORKDIR /app

# 复制包文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 复制包文件和锁文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制构建好的应用
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# 暴露应用端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]

# 构建阶段
FROM node:22-alpine AS build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:22-alpine AS production

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产环境依赖
RUN npm install --only=production

# 从构建阶段复制构建后的文件
COPY --from=build /app/dist ./dist

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "run", "start:prod"]

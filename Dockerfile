# 使用官方 Node.js 运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# 安装依赖
RUN cd server && npm ci --only=production
RUN cd client && npm ci --only=production

# 复制源代码
COPY server/ ./server/
COPY client/ ./client/

# 构建前端应用
RUN cd client && npm run build

# 暴露端口
EXPOSE 5000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "server/index.js"]
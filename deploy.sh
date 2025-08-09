#!/bin/bash

# 学生管理系统部署脚本
# 使用方法: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
echo "开始部署到 $ENV 环境..."

# 检查是否安装了必要的工具
command -v node >/dev/null 2>&1 || { echo "错误: 需要安装 Node.js" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "错误: 需要安装 npm" >&2; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "警告: 建议安装 PM2 进行进程管理" >&2; }

# 拉取最新代码
echo "拉取最新代码..."
git pull origin main

# 安装服务端依赖
echo "安装服务端依赖..."
cd server
npm ci --only=production
cd ..

# 安装客户端依赖并构建
echo "构建前端应用..."
cd client
npm ci
npm run build
cd ..

# 检查环境变量文件
if [ ! -f "server/.env" ]; then
    echo "警告: server/.env 文件不存在，请从 .env.example 复制并配置"
    cp server/.env.example server/.env
    echo "请编辑 server/.env 文件并重新运行部署脚本"
    exit 1
fi

# 创建必要的目录
mkdir -p server/uploads
mkdir -p server/logs

# 使用 PM2 部署 (如果已安装)
if command -v pm2 >/dev/null 2>&1; then
    echo "使用 PM2 启动应用..."
    
    # 停止现有进程
    pm2 stop student-system 2>/dev/null || true
    pm2 delete student-system 2>/dev/null || true
    
    # 启动新进程
    cd server
    pm2 start index.js --name "student-system" --env $ENV
    pm2 save
    
    echo "应用已通过 PM2 启动"
    pm2 status
else
    echo "直接启动应用..."
    cd server
    NODE_ENV=$ENV nohup node index.js > ../logs/app.log 2>&1 &
    echo $! > ../logs/app.pid
    echo "应用已启动，PID: $(cat ../logs/app.pid)"
fi

echo "部署完成！"
echo "前端构建文件位于: client/build/"
echo "如果使用 Nginx，请将构建文件部署到 web 服务器"
echo "API 服务运行在配置的端口上"
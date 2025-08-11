# GitHub Actions 部署指南

本指南将帮助您将学生网站部署到GitHub Actions，并通过自定义域名访问。

## 目录
1. [准备工作](#准备工作)
2. [GitHub Actions 配置](#github-actions-配置)
3. [域名配置](#域名配置)
4. [项目清理](#项目清理)
5. [部署验证](#部署验证)
6. [故障排除](#故障排除)

## 准备工作

### 1. 创建GitHub仓库
```bash
# 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. 设置GitHub Secrets
在GitHub仓库设置中添加以下Secrets：
- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT密钥
- `DEEPSEEK_API_KEY`: DeepSeek API密钥（如果使用）
- `SERVER_HOST`: 服务器IP地址
- `SERVER_USER`: 服务器用户名
- `SERVER_SSH_KEY`: 服务器SSH私钥

## GitHub Actions 配置

### 1. 创建工作流文件
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Server

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          client/package-lock.json
          server/package-lock.json
    
    - name: Install client dependencies
      run: |
        cd client
        npm ci
    
    - name: Install server dependencies
      run: |
        cd server
        npm ci
    
    - name: Build client
      run: |
        cd client
        npm run build
    
    - name: Test server
      run: |
        cd server
        npm test
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/test
        JWT_SECRET: test-secret

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          client/package-lock.json
          server/package-lock.json
    
    - name: Install dependencies and build
      run: |
        cd client
        npm ci
        npm run build
        cd ../server
        npm ci
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          # 停止现有服务
          pm2 stop student-website || true
          
          # 备份当前部署
          if [ -d "/var/www/student-website" ]; then
            sudo cp -r /var/www/student-website /var/www/student-website-backup-$(date +%Y%m%d-%H%M%S)
          fi
          
          # 创建部署目录
          sudo mkdir -p /var/www/student-website
          cd /var/www/student-website
          
          # 拉取最新代码
          sudo git pull origin main || sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .
          
          # 安装依赖
          cd client
          sudo npm ci
          sudo npm run build
          
          cd ../server
          sudo npm ci
          
          # 设置环境变量
          sudo tee .env > /dev/null <<EOF
          NODE_ENV=production
          PORT=5000
          MONGODB_URI=${{ secrets.MONGODB_URI }}
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          DEEPSEEK_API_KEY=${{ secrets.DEEPSEEK_API_KEY }}
          EOF
          
          # 设置文件权限
          sudo chown -R www-data:www-data /var/www/student-website
          sudo chmod -R 755 /var/www/student-website
          
          # 启动服务
          pm2 start ecosystem.config.js --env production
          pm2 save
          
          # 重新加载Nginx
          sudo nginx -t && sudo systemctl reload nginx
```

### 2. 创建生产环境配置
创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'student-website',
    script: './server/index.js',
    cwd: '/var/www/student-website',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/student-website-error.log',
    out_file: '/var/log/pm2/student-website-out.log',
    log_file: '/var/log/pm2/student-website.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

## 域名配置

### 1. DNS设置
在您的域名提供商处设置DNS记录：
```
A记录: @ -> 您的服务器IP
A记录: www -> 您的服务器IP
```

### 2. Nginx配置
创建 `/etc/nginx/sites-available/student-website`：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 前端静态文件
    location / {
        root /var/www/student-website/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 3. SSL证书配置
```bash
# 安装Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. 启用站点
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/student-website /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载Nginx
sudo systemctl reload nginx
```

## 项目清理

### 1. 删除多余的部署文件
```bash
# 删除本地部署相关文件
rm -f cleanup.sh
rm -f quick-fix.sh
rm -f diagnose.sh
rm -f check-status.sh
rm -f deploy.sh
rm -f start-production.sh

# 删除故障排除文档
rm -f CONNECTION_REFUSED_FIX.md
rm -f FIX_500_ERROR.md
rm -f FRONTEND_ACCESS_FIX.md
rm -f MANUAL_DEPLOYMENT_GUIDE.md
rm -f STEP_BY_STEP_COMMANDS.md
rm -f TROUBLESHOOTING.md
rm -f DEPLOYMENT_CHECKLIST.md

# 删除Docker相关文件（如果不使用Docker）
rm -f Dockerfile
rm -f docker-compose.yml

# 删除Nginx示例配置
rm -f nginx.conf.example
```

### 2. 更新.gitignore
确保 `.gitignore` 包含：
```
# 环境变量
.env
.env.local
.env.production

# 日志文件
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 依赖
node_modules/

# 构建输出
client/build/
dist/

# 上传文件
server/uploads/

# PM2
.pm2/

# 系统文件
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# 临时文件
*.tmp
*.temp
```

### 3. 清理package.json脚本
更新根目录 `package.json`：
```json
{
  "name": "student-website",
  "version": "1.0.0",
  "description": "学生个人网站",
  "scripts": {
    "install:client": "cd client && npm install",
    "install:server": "cd server && npm install",
    "install:all": "npm run install:client && npm run install:server",
    "build:client": "cd client && npm run build",
    "start:server": "cd server && npm start",
    "dev:client": "cd client && npm start",
    "dev:server": "cd server && npm run dev",
    "test:client": "cd client && npm test",
    "test:server": "cd server && npm test",
    "lint": "cd client && npm run lint && cd ../server && npm run lint"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
  },
  "keywords": ["student", "website", "portfolio", "study"],
  "author": "Your Name",
  "license": "MIT"
}
```

## 部署验证

### 1. 检查部署状态
```bash
# 检查GitHub Actions状态
# 访问: https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions

# 检查服务器状态
ssh your-server
pm2 status
sudo systemctl status nginx
curl -I https://yourdomain.com/api/health
```

### 2. 测试网站功能
- 访问 `https://yourdomain.com`
- 测试API接口
- 检查所有页面功能
- 验证移动端响应

## 故障排除

### 常见问题

1. **部署失败**
   - 检查GitHub Secrets配置
   - 查看Actions日志
   - 验证服务器SSH连接

2. **SSL证书问题**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

3. **域名解析问题**
   ```bash
   nslookup yourdomain.com
   dig yourdomain.com
   ```

4. **服务启动失败**
   ```bash
   pm2 logs student-website
   sudo journalctl -u nginx -f
   ```

### 监控和维护

1. **设置监控**
   - 使用Uptime Robot或类似服务监控网站可用性
   - 配置PM2监控
   - 设置日志轮转

2. **定期维护**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade
   
   # 清理日志
   pm2 flush
   sudo journalctl --vacuum-time=30d
   
   # 检查磁盘空间
   df -h
   ```

## 总结

通过以上配置，您的网站将：
- 自动通过GitHub Actions部署
- 支持HTTPS访问
- 具备生产环境的性能和安全性
- 易于维护和更新

记住定期备份数据库和重要文件，并监控网站性能和安全性。
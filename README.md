# 学生管理系统

一个基于 React + Node.js 的全栈学生管理系统，包含学习计划、番茄钟、提醒事项、笔记管理等功能。

## 功能特性

- 🎯 学习计划管理
- 🍅 番茄钟计时器
- 📝 学习笔记
- ⏰ 提醒事项
- 📊 学习统计
- 🔗 外部链接管理
- 💬 消息系统
- 👤 用户管理
- ⚙️ 系统设置
- 🤖 AI 助手集成 (DeepSeek)

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Axios

### 后端
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT 认证

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone <your-repo-url>
cd NewWeb
```

2. 安装依赖
```bash
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

3. 配置环境变量
```bash
# 服务端配置
cd server
cp .env.example .env
# 编辑 .env 文件，填入您的配置信息

# 客户端配置
cd ../client
cp .env.example .env
# 编辑 .env 文件，填入您的配置信息
```

4. 启动 MongoDB
```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# 或者直接启动
mongod
```

5. 创建管理员账户
```bash
cd server
node scripts/createAdmin.js
```

6. 启动应用
```bash
# 启动服务端 (在 server 目录)
npm start

# 启动客户端 (在 client 目录)
npm start
```

7. 访问应用
- 前端: http://localhost:3000
- 后端 API: http://localhost:5000

## 部署指南

### 生产环境配置

1. 构建前端应用
```bash
cd client
npm run build
```

2. 配置生产环境变量
```bash
# 服务端 .env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-strong-jwt-secret
CLIENT_URL=https://your-domain.com
```

3. 使用 PM2 部署 (推荐)
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
cd server
pm2 start index.js --name "student-system"

# 设置开机自启
pm2 startup
pm2 save
```

### Docker 部署

```bash
# 构建镜像
docker build -t student-system .

# 运行容器
docker run -d -p 5000:5000 --name student-system student-system
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 环境变量说明

### 服务端 (.env)

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 5000 |
| NODE_ENV | 运行环境 | development |
| MONGODB_URI | MongoDB 连接字符串 | mongodb://localhost:27017/student_website |
| JWT_SECRET | JWT 密钥 | - |
| JWT_EXPIRE | JWT 过期时间 | 7d |
| CLIENT_URL | 前端地址 | http://localhost:3000 |
| DEEPSEEK_API_KEY | DeepSeek API 密钥 | - |

### 客户端 (.env)

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| REACT_APP_API_URL | 后端 API 地址 | http://localhost:5000/api |
| REACT_APP_DEEPSEEK_API_KEY | DeepSeek API 密钥 | - |

## 开发指南

### 项目结构

```
NewWeb/
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API 服务
│   │   ├── contexts/      # React Context
│   │   └── utils/         # 工具函数
│   └── public/
├── server/                # Node.js 后端
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── middleware/       # 中间件
│   └── utils/            # 工具函数
└── README.md
```

### API 文档

主要 API 端点：

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/study/plans` - 获取学习计划
- `POST /api/study/plans` - 创建学习计划
- `GET /api/reminders` - 获取提醒事项
- `POST /api/pomodoro/sessions` - 创建番茄钟会话

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果您遇到任何问题或有建议，请创建 [Issue](https://github.com/your-username/your-repo/issues)。
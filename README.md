# 学生个人网站

一个功能丰富的学生个人网站，集成了学习工具、作品展示和生产力功能，支持GitHub Actions自动部署。

## 🚀 功能特性

### 🎯 学习管理
- **番茄钟计时器**: 专注学习时间管理
- **学习计划**: 制定和跟踪学习目标
- **学习笔记**: 在线笔记编辑和管理
- **学习资料**: 文件上传和分类管理

### 📝 任务管理
- **待办事项**: 任务创建、编辑和状态跟踪
- **提醒功能**: 重要事项提醒
- **日程安排**: 课程和活动安排

### 💼 作品展示
- **项目作品集**: 展示个人项目和作品
- **博客系统**: 分享学习心得和技术文章
- **个人简介**: 完整的个人信息展示

### 🔗 实用工具
- **外部链接管理**: 常用网站快速访问
- **消息系统**: 内部消息和通知
- **系统设置**: 个性化配置选项

### 🤖 AI 集成
- **DeepSeek AI**: 智能学习助手
- **AI 问答**: 学习问题智能解答
- **内容生成**: AI 辅助内容创作

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript**: 现代化用户界面
- **Tailwind CSS**: 快速样式开发
- **Lucide React**: 精美的图标库

### 后端
- **Node.js** + **Express.js**: 服务器框架
- **MongoDB** + **Mongoose**: 数据库
- **JWT**: 用户认证
- **PM2**: 进程管理

### 部署
- **GitHub Actions**: 自动化CI/CD
- **Nginx**: 反向代理
- **SSL/HTTPS**: 安全连接

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd student-website
```

2. **安装依赖**
```bash
npm run install:all
```

3. **环境配置**
```bash
# 复制环境变量模板
cp server/.env.example server/.env
cp client/.env.example client/.env

# 编辑 server/.env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_website
JWT_SECRET=your-jwt-secret-key
DEEPSEEK_API_KEY=your-deepseek-api-key
```

4. **启动应用**
```bash
# 开发模式（推荐）
npm run dev

# 访问 http://localhost:3000
```

## 🌐 GitHub Actions 部署

### 1. 准备服务器
- Ubuntu 20.04+ 服务器
- 域名解析到服务器IP
- SSH访问权限

### 2. 配置GitHub Secrets
在GitHub仓库设置中添加以下Secrets：

| Secret名称 | 描述 | 示例 |
|-----------|------|------|
| `SERVER_HOST` | 服务器IP地址 | `123.456.789.0` |
| `SERVER_USER` | 服务器用户名 | `root` 或 `ubuntu` |
| `SERVER_SSH_KEY` | SSH私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `MONGODB_URI` | MongoDB连接字符串 | `mongodb://localhost:27017/student_website` |
| `JWT_SECRET` | JWT密钥 | `your-super-secret-jwt-key` |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | `sk-...` |

### 3. 修改配置
1. 更新 `.github/workflows/deploy.yml` 中的仓库地址
2. 修改域名配置（如需要）

### 4. 服务器初始配置
```bash
# 安装基础环境
sudo apt update
sudo apt install -y nginx mongodb nodejs npm

# 安装PM2
sudo npm install -g pm2

# 配置Nginx（参考部署指南）
# 配置SSL证书（参考部署指南）
```

### 5. 触发部署
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

部署将自动开始，可在GitHub Actions页面查看进度。

## 📚 详细文档

- **[GitHub Actions部署指南](GITHUB_ACTIONS_DEPLOYMENT.md)** - 完整的自动化部署教程
- **[API文档](#api-接口)** - 后端API接口说明
- **[项目结构](#项目结构)** - 代码组织结构

## 🔧 项目结构

```
student-website/
├── .github/workflows/      # GitHub Actions配置
├── client/                 # React前端
│   ├── src/components/     # 组件
│   ├── src/pages/         # 页面
│   └── src/services/      # API服务
├── server/                # Node.js后端
│   ├── controllers/       # 控制器
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   └── middleware/       # 中间件
├── ecosystem.config.js    # PM2配置
└── package.json          # 项目配置
```

## 🔌 API 接口

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息

### 学习管理
- `GET /api/study/plans` - 获取学习计划
- `POST /api/study/plans` - 创建学习计划
- `GET /api/study/notes` - 获取学习笔记

### 任务管理
- `GET /api/todos` - 获取待办事项
- `POST /api/todos` - 创建待办事项
- `PUT /api/todos/:id` - 更新待办事项

### 作品展示
- `GET /api/portfolio` - 获取作品集
- `POST /api/portfolio` - 添加作品
- `GET /api/blog` - 获取博客文章

## 🧹 项目清理

运行清理脚本删除多余文件：
```bash
./cleanup-project.sh
```

这将删除：
- 本地部署脚本
- 故障排除文档
- Docker配置文件
- 其他临时文件



## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: [GitHub Repository](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)
- 问题反馈: [Issues](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
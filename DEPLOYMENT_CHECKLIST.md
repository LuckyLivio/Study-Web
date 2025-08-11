# GitHub Actions 部署清单

在推送代码到GitHub之前，请确保完成以下步骤：

## ✅ 必须完成的步骤

### 1. 更新GitHub Actions配置
- [ ] 修改 `.github/workflows/deploy.yml` 中的仓库地址
- [ ] 将 `YOUR_USERNAME/YOUR_REPO_NAME` 替换为实际的GitHub仓库地址

### 2. 配置GitHub Secrets
在GitHub仓库的 Settings > Secrets and variables > Actions 中添加：

- [ ] `SERVER_HOST` - 服务器IP地址
- [ ] `SERVER_USER` - 服务器用户名 (通常是 `root` 或 `ubuntu`)
- [ ] `SERVER_SSH_KEY` - SSH私钥内容
- [ ] `MONGODB_URI` - MongoDB连接字符串
- [ ] `JWT_SECRET` - JWT密钥
- [ ] `DEEPSEEK_API_KEY` - DeepSeek API密钥（可选）

### 3. 服务器准备
- [ ] 确保服务器已安装 Node.js 18+
- [ ] 确保服务器已安装 MongoDB
- [ ] 确保服务器已安装 Nginx
- [ ] 确保服务器已安装 PM2 (`npm install -g pm2`)
- [ ] 确保SSH密钥可以访问服务器

### 4. 域名配置（如果使用自定义域名）
- [ ] 配置DNS A记录指向服务器IP
- [ ] 在服务器上配置Nginx虚拟主机
- [ ] 配置SSL证书（推荐使用Let's Encrypt）

## 🔧 可选配置

### 环境变量优化
- [ ] 检查 `server/.env.example` 中的所有变量
- [ ] 确保生产环境的安全配置

### 性能优化
- [ ] 配置Nginx gzip压缩
- [ ] 配置静态资源缓存
- [ ] 配置PM2集群模式（如需要）

## 🚀 部署步骤

### 1. 提交代码
```bash
git add .
git commit -m "Setup GitHub Actions deployment"
git push origin main
```

### 2. 监控部署
- [ ] 在GitHub Actions页面查看部署进度
- [ ] 检查部署日志是否有错误
- [ ] 确认服务器上的应用正常运行

### 3. 验证部署
- [ ] 访问网站确认前端正常
- [ ] 测试API接口 (`/api/health`)
- [ ] 检查数据库连接
- [ ] 测试所有主要功能

## 🔍 故障排除

如果部署失败，检查以下项目：

1. **GitHub Actions失败**
   - 检查Secrets配置是否正确
   - 查看Actions日志中的错误信息
   - 确认服务器SSH连接正常

2. **服务器部署失败**
   - SSH到服务器检查PM2状态: `pm2 status`
   - 查看应用日志: `pm2 logs student-website`
   - 检查Nginx状态: `sudo systemctl status nginx`

3. **网站无法访问**
   - 检查域名DNS解析
   - 确认防火墙设置
   - 验证Nginx配置: `sudo nginx -t`

## 📚 相关文档

- [完整部署指南](GITHUB_ACTIONS_DEPLOYMENT.md)
- [项目README](README.md)
- [GitHub Actions官方文档](https://docs.github.com/en/actions)

---

完成所有检查项后，您的网站就可以通过GitHub Actions自动部署了！🎉
# Study-Web｜学生个人网站练习

React + Express + MongoDB 的前后端项目，包含作品、博客、学习记录和日程等页面与 API。仓库有完整的路由、模型和前端组件，但部分工具卡片和第三方能力仍是演示实现，适合作为 Web 工程实践展示。

## 已实现与演示边界

- 账号注册/登录、作品和博客的增删改查、学习计划/笔记/资料、课表和待办等有对应页面与服务端路由。
- 前端天气组件使用模拟数据；“待开发项目”卡片使用静态样例；服务端 `/api/ai` 目前只返回“待开发”，邮件测试也使用模拟发送。
- 有 GitHub Actions 部署配置，但仓库本身不证明当前线上服务与该分支同步。可访问的网站 `https://livio.wang` 目前显示“Livio 自习室”，不要将它误作本仓库已验证的部署演示。

**个人贡献**：本项目由我独立完成。我实现了 React 页面、Express API、MongoDB 模型和文件上传流程；天气、AI 和邮件等演示功能的边界见下文。代码入口：[`client/src/App.tsx`](client/src/App.tsx)、[`server/index.js`](server/index.js)。面试中可以讲前后端路由分工，以及将模拟功能替换为真实服务时的接口边界。

## 本地运行

需要 Node.js 20+、npm 10+ 和本地 MongoDB。根目录依次执行：

```bash
npm install
npm run install:all
```

复制 [`server/.env.example`](server/.env.example) 为 `server/.env`，设置随机的 `JWT_SECRET` 并确认 `MONGODB_URI`。前端默认请求 `http://localhost:5000/api`。然后运行：

```bash
npm run dev
```

前端开发服务通常在 `http://localhost:3000`，服务端健康检查为 `http://localhost:5000/api/health`。端口可能被本机占用，具体以启动输出为准。

**AI 功能说明**：客户端代码中有直接读取 `REACT_APP_DEEPSEEK_API_KEY` 的实验性调用，构建时该变量会暴露给浏览器。不要填写真实密钥作为公开部署配置；后续应改为服务端代理并补权限和用量控制。此处没有把它列为已完成的安全功能。

早期提交的前端构建产物和旧版客户端源码包含一把独立的 DeepSeek API 密钥。当前代码已移除构建产物并忽略 `client/build/`，可更新的 Git 分支历史也已重写。2026-09-24 已在当前 DeepSeek 账号的完整密钥列表中核对，该旧密钥已不在列表中。GitHub 的旧 PR 引用、缓存或外部克隆仍可能保留副本。重新部署前应从当前源码生成新的构建产物，不能继续使用旧文件。

仓库包含服务器部署配置及 `JWT_SECRET` 环境变量，但公开的 GitHub Actions 部署记录不足以证明生产环境是否使用过旧 JWT 密钥。如果实际服务器或 Render 服务曾配置旧值，应在对应环境变量中换成新的随机值并重启应用；已有 JWT 会随签名密钥变化失效。新密钥不得提交到 Git。

## 待完善

天气与项目卡片替换为真实数据；AI 和邮件测试接入后端；补充真实端到端验证与可公开截图。仓库中的 `npm run test:server` 仍是未配置测试的占位脚本。当前 `npm run build` 使用 POSIX 环境变量写法，在 Windows PowerShell 下不能直接执行。

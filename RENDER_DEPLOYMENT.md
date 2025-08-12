# Render 部署配置说明

## 问题诊断

前端无法打开的主要问题是：

1. **API URL 配置错误**：前端在生产环境中使用了错误的API URL
2. **静态文件服务缺失**：后端服务器没有配置为提供前端静态文件
3. **构建脚本不完整**：只安装了前端依赖，没有安装后端依赖

## 已修复的配置

### 1. 前端环境变量 (`client/.env.production`)
```
REACT_APP_API_URL=/api
```
使用相对路径，因为前端和后端在同一个Render服务中运行。

### 2. 后端静态文件服务 (`server/index.js`)
- 添加了生产环境下的静态文件服务
- 配置了React Router的fallback处理
- 区分API请求和前端路由请求

### 3. 构建脚本 (`package.json`)
```json
"build:render": "npm install && cd server && npm install && cd ../client && npm install --legacy-peer-deps --no-audit --no-fund && NODE_ENV=production CI=false npm run build"
```
确保安装所有依赖并构建前端。

### 4. CORS 配置
- 添加了Render域名到CORS白名单
- 更新了CSP策略以允许Render域名连接

## 部署流程

1. Render执行 `npm run build:render` 构建项目
2. 安装根目录、后端和前端的所有依赖
3. 构建React前端到 `client/build` 目录
4. 执行 `npm start` 启动后端服务器
5. 后端服务器同时提供API服务和前端静态文件

## 访问方式

- 前端页面：`https://your-app.onrender.com`
- API接口：`https://your-app.onrender.com/api/*`
- 健康检查：`https://your-app.onrender.com/api/health`

## 注意事项

1. 确保Render服务的环境变量中设置了 `NODE_ENV=production`
2. 确保MongoDB连接字符串正确配置
3. 如果使用自定义域名，需要更新CORS配置中的域名列表
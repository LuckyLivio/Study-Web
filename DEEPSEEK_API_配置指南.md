# DeepSeek API 配置指南

## 概述

本项目的AI聊天助手功能基于DeepSeek API构建，需要配置API密钥才能正常使用。

## 配置步骤

### 1. 获取API密钥

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号并登录
3. 进入控制台，创建新的API密钥
4. 复制生成的API密钥（请妥善保管）

### 2. 配置环境变量

在项目的 `client/.env` 文件中添加以下配置：

```bash
# DeepSeek API 配置
REACT_APP_DEEPSEEK_API_KEY=your_actual_api_key_here
REACT_APP_DEEPSEEK_BASE_URL=https://api.deepseek.com
REACT_APP_DEEPSEEK_MODEL=deepseek-chat
```

**重要说明：**
- 将 `your_actual_api_key_here` 替换为你的真实API密钥
- 不要在代码中直接写入API密钥
- 确保 `.env` 文件已添加到 `.gitignore` 中

### 3. 重启开发服务器

配置完成后，需要重启开发服务器使环境变量生效：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
cd client
npm start
```

## 功能特性

### AI聊天助手功能

- **智能对话**：基于DeepSeek模型的自然语言处理
- **学习辅助**：专门针对学习和技术问题优化
- **上下文理解**：支持多轮对话，理解对话历史
- **快速问题**：预设常用学习问题，一键咨询

### 安全特性

- **环境变量保护**：API密钥通过环境变量管理
- **错误处理**：完善的API调用错误处理机制
- **状态检查**：实时检查API配置状态

## 使用说明

### 界面说明

1. **配置状态指示器**：右上角齿轮图标显示配置状态
   - 🟢 绿色：API已正确配置
   - 🔴 红色：API未配置或配置错误

2. **配置面板**：点击齿轮图标查看详细配置说明

3. **快速问题**：API配置完成后显示预设问题

### 常见问题

**Q: 配置后仍显示未配置？**
A: 请确保重启了开发服务器，环境变量需要重启后才能生效。

**Q: API调用失败？**
A: 请检查：
- API密钥是否正确
- 网络连接是否正常
- DeepSeek账户是否有足够余额

**Q: 如何查看API使用情况？**
A: 登录DeepSeek控制台查看API调用统计和余额。

## 开发说明

### 相关文件

- `src/services/deepseekApi.ts` - API服务封装
- `src/components/tools/AIChat.tsx` - 聊天界面组件
- `client/.env` - 环境变量配置

### API服务特性

- **类型安全**：完整的TypeScript类型定义
- **错误处理**：统一的错误处理机制
- **配置检查**：自动检查API配置状态
- **流式支持**：支持流式响应（可选）

### 自定义配置

可以通过环境变量自定义以下参数：

```bash
# 模型选择
REACT_APP_DEEPSEEK_MODEL=deepseek-chat

# API基础URL（通常不需要修改）
REACT_APP_DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 注意事项

1. **API密钥安全**：
   - 不要将API密钥提交到版本控制系统
   - 不要在客户端代码中硬编码API密钥
   - 定期轮换API密钥

2. **使用限制**：
   - 注意API调用频率限制
   - 监控API使用量和费用
   - 合理设置对话历史长度以控制token消耗

3. **生产环境**：
   - 生产环境部署时需要设置相应的环境变量
   - 考虑使用更安全的密钥管理方案

## 技术支持

如果遇到配置问题，请：

1. 检查控制台错误信息
2. 确认API密钥格式正确
3. 验证网络连接
4. 查看DeepSeek官方文档

---

**最后更新：** 2024年12月
**版本：** 1.0.0
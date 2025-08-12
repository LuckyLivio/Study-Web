const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// 安全中间件
app.use(helmet());

// 请求日志
app.use(morgan('combined'));

// 跨域配置
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3001',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://livio.wang',
    'https://livio.wang'
  ],
  credentials: true
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 提供React构建后的静态文件
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_website', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 连接成功'))
.catch(err => console.error('MongoDB 连接失败:', err));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/study', require('./routes/study'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/links', require('./routes/links'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/pomodoro', require('./routes/pomodoro'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/settings', require('./routes/settings'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 处理React Router的前端路由
app.get('*', (req, res) => {
  // 如果请求的是API路径，返回404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: '接口不存在' });
  }
  // 否则返回React应用的index.html
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JWT Token
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // 从请求头获取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 从cookie获取token（如果有的话）
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，请先登录'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 获取用户信息
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '账户已被禁用'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token已过期，请重新登录'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 验证管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
};

// 验证用户权限（用户只能访问自己的数据）
const requireOwnershipOrAdmin = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (req.user.role === 'admin' || req.user._id.toString() === userId) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: '权限不足'
    });
  }
};

// 可选认证（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth
};
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate, requireAdmin, requireOwnershipOrAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用'
      });
    }
    
    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });
    
    await user.save();
    
    // 生成token
    const token = user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          fullName: user.fullName
        },
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败',
      error: error.message
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供账号和密码'
      });
    }
    
    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '账号或密码错误'
      });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '账号或密码错误'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '账户已被禁用'
      });
    }
    
    // 更新最后登录时间
    await user.updateLastLogin();
    
    // 生成token
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          fullName: user.fullName,
          lastLogin: user.lastLogin,
          preferences: user.preferences
        },
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// 获取当前用户信息
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          profile: req.user.profile,
          fullName: req.user.fullName,
          preferences: req.user.preferences,
          lastLogin: req.user.lastLogin,
          loginCount: req.user.loginCount,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户资料
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    const user = req.user;
    
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: '资料更新成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          fullName: user.fullName,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({
      success: false,
      message: '更新资料失败',
      error: error.message
    });
  }
});

// 修改密码
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供当前密码和新密码'
      });
    }
    
    // 获取用户（包含密码）
    const user = await User.findById(req.user._id).select('+password');
    
    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败',
      error: error.message
    });
  }
});

// 验证token
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token有效',
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
});

// 登出（客户端处理，服务端可选择性实现token黑名单）
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

// ==================== 管理员路由 ====================

// 获取所有用户（管理员）
router.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 更新用户状态（管理员）
router.put('/admin/users/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `用户已${isActive ? '启用' : '禁用'}`,
      data: { user }
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
});

// 更新用户角色（管理员）
router.put('/admin/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: '用户角色更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户角色失败'
    });
  }
});

// 删除用户（管理员）
router.delete('/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 不能删除自己
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账户'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败'
    });
  }
});

// 获取用户统计信息（管理员）
router.get('/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        recentUsers,
        inactiveUsers: totalUsers - activeUsers
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败'
    });
  }
});

module.exports = router;
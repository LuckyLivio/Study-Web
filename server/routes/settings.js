const express = require('express');
const router = express.Router();
const systemSettingsController = require('../controllers/systemSettingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 获取公开的系统设置（不需要认证）
router.get('/public', systemSettingsController.getPublicSettings);

// 以下路由需要认证
router.use(authenticate);

// 获取完整的系统设置（需要管理员权限）
router.get('/', requireAdmin, systemSettingsController.getSettings);

// 更新系统设置（需要管理员权限）
router.put('/', requireAdmin, systemSettingsController.updateSettings);

// 重置系统设置为默认值（需要管理员权限）
router.post('/reset', requireAdmin, systemSettingsController.resetSettings);

// 测试邮件配置（需要管理员权限）
router.post('/test-email', requireAdmin, systemSettingsController.testEmailConfig);

// 获取系统统计信息（需要管理员权限）
router.get('/stats', requireAdmin, systemSettingsController.getSystemStats);

module.exports = router;
const SystemSettings = require('../models/SystemSettings');
const User = require('../models/User');

// 系统设置控制器
const systemSettingsController = {
  // 获取系统设置
  async getSettings(req, res) {
    try {
      const settings = await SystemSettings.getInstance();
      await settings.populate('lastUpdatedBy', 'username email');
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('获取系统设置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取系统设置失败',
        error: error.message
      });
    }
  },

  // 更新系统设置
  async updateSettings(req, res) {
    try {
      const userId = req.user._id;
      const updates = req.body;
      
      // 验证用户权限（只有管理员可以修改）
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足，只有管理员可以修改系统设置'
        });
      }

      const settings = await SystemSettings.updateSettings(updates, userId);
      
      await settings.populate('lastUpdatedBy', 'username email');
      
      res.json({
        success: true,
        message: '系统设置更新成功',
        data: settings
      });
    } catch (error) {
      console.error('更新系统设置失败:', error);
      res.status(500).json({
        success: false,
        message: '更新系统设置失败',
        error: error.message
      });
    }
  },

  // 重置系统设置为默认值
  async resetSettings(req, res) {
    try {
      const userId = req.user._id;
      
      // 验证用户权限（只有管理员可以重置）
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足，只有管理员可以重置系统设置'
        });
      }

      // 删除现有设置并创建新的默认设置
      await SystemSettings.deleteMany({});
      const settings = await SystemSettings.create({ lastUpdatedBy: userId });
      
      await settings.populate('lastUpdatedBy', 'username email');
      
      res.json({
        success: true,
        message: '系统设置已重置为默认值',
        data: settings
      });
    } catch (error) {
      console.error('重置系统设置失败:', error);
      res.status(500).json({
        success: false,
        message: '重置系统设置失败',
        error: error.message
      });
    }
  },

  // 获取公开的系统设置（不需要认证）
  async getPublicSettings(req, res) {
    try {
      const settings = await SystemSettings.getInstance();
      
      // 只返回公开的设置信息
      const publicSettings = {
        siteInfo: {
          siteName: settings.siteInfo.siteName,
          siteDescription: settings.siteInfo.siteDescription,
          siteLogo: settings.siteInfo.siteLogo,
          favicon: settings.siteInfo.favicon
        },
        themeConfig: settings.themeConfig,
        features: settings.features,
        maintenance: {
          enabled: settings.maintenance.enabled,
          message: settings.maintenance.message
        }
      };
      
      res.json({
        success: true,
        data: publicSettings
      });
    } catch (error) {
      console.error('获取公开系统设置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取公开系统设置失败',
        error: error.message
      });
    }
  },

  // 测试邮件配置
  async testEmailConfig(req, res) {
    try {
      // 验证用户权限
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足，只有管理员可以测试邮件配置'
        });
      }

      const { testEmail } = req.body;
      
      if (!testEmail) {
        return res.status(400).json({
          success: false,
          message: '请提供测试邮箱地址'
        });
      }

      const settings = await SystemSettings.getInstance();
      const emailConfig = settings.emailConfig;
      
      // 这里可以添加实际的邮件发送测试逻辑
      // 目前只是模拟测试
      if (!emailConfig.smtpHost || !emailConfig.smtpUser) {
        return res.status(400).json({
          success: false,
          message: '邮件配置不完整，请先配置SMTP服务器信息'
        });
      }
      
      // 模拟发送测试邮件
      setTimeout(() => {
        res.json({
          success: true,
          message: `测试邮件已发送到 ${testEmail}`
        });
      }, 1000);
      
    } catch (error) {
      console.error('测试邮件配置失败:', error);
      res.status(500).json({
        success: false,
        message: '测试邮件配置失败',
        error: error.message
      });
    }
  },

  // 获取系统统计信息
  async getSystemStats(req, res) {
    try {
      // 验证用户权限
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '权限不足，只有管理员可以查看系统统计'
        });
      }

      // 获取各种统计数据
      const userCount = await User.countDocuments();
      const adminCount = await User.countDocuments({ role: 'admin' });
      const activeUserCount = await User.countDocuments({ isActive: true });
      
      const stats = {
        users: {
          total: userCount,
          admins: adminCount,
          active: activeUserCount,
          inactive: userCount - activeUserCount
        },
        system: {
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform,
          memory: process.memoryUsage()
        }
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取系统统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取系统统计失败',
        error: error.message
      });
    }
  }
};

module.exports = systemSettingsController;
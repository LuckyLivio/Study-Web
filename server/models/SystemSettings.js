const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // 网站基本信息
  siteInfo: {
    siteName: {
      type: String,
      default: '学生管理系统',
      maxlength: [100, '网站名称不能超过100个字符']
    },
    siteDescription: {
      type: String,
      default: '一个功能完整的学生管理系统',
      maxlength: [500, '网站描述不能超过500个字符']
    },
    siteKeywords: {
      type: String,
      default: '学生,管理,系统,学习,计划',
      maxlength: [200, '关键词不能超过200个字符']
    },
    siteLogo: {
      type: String,
      default: null
    },
    favicon: {
      type: String,
      default: null
    },
    contactEmail: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
    },
    contactPhone: {
      type: String,
      maxlength: [20, '联系电话不能超过20个字符']
    },
    address: {
      type: String,
      maxlength: [200, '地址不能超过200个字符']
    }
  },
  
  // 系统配置
  systemConfig: {
    // 用户注册设置
    allowRegistration: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    },
    defaultUserRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    
    // 安全设置
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: [1, '最大登录尝试次数不能少于1次'],
      max: [20, '最大登录尝试次数不能超过20次']
    },
    sessionTimeout: {
      type: Number,
      default: 7, // 天数
      min: [1, '会话超时时间不能少于1天'],
      max: [30, '会话超时时间不能超过30天']
    },
    
    // 文件上传设置
    maxFileSize: {
      type: Number,
      default: 10, // MB
      min: [1, '最大文件大小不能少于1MB'],
      max: [100, '最大文件大小不能超过100MB']
    },
    allowedFileTypes: {
      type: [String],
      default: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
    },
    
    // 分页设置
    defaultPageSize: {
      type: Number,
      default: 10,
      min: [5, '默认分页大小不能少于5'],
      max: [100, '默认分页大小不能超过100']
    }
  },
  
  // 功能开关
  features: {
    enableBlog: {
      type: Boolean,
      default: true
    },
    enablePortfolio: {
      type: Boolean,
      default: true
    },
    enableChat: {
      type: Boolean,
      default: true
    },
    enableReminders: {
      type: Boolean,
      default: true
    },
    enablePomodoro: {
      type: Boolean,
      default: true
    },
    enableStudyPlans: {
      type: Boolean,
      default: true
    },
    enableExternalLinks: {
      type: Boolean,
      default: true
    }
  },
  
  // 邮件配置
  emailConfig: {
    smtpHost: {
      type: String,
      default: ''
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpUser: {
      type: String,
      default: ''
    },
    smtpPassword: {
      type: String,
      default: '',
      select: false // 默认查询时不返回密码
    },
    fromEmail: {
      type: String,
      default: ''
    },
    fromName: {
      type: String,
      default: '学生管理系统'
    }
  },
  
  // 主题配置
  themeConfig: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#10B981'
    },
    accentColor: {
      type: String,
      default: '#F59E0B'
    },
    defaultTheme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  
  // 维护模式
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: '系统正在维护中，请稍后再试',
      maxlength: [500, '维护消息不能超过500个字符']
    },
    allowedIPs: {
      type: [String],
      default: []
    }
  },
  
  // 最后更新信息
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 确保只有一个系统设置文档
systemSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// 更新设置的静态方法
systemSettingsSchema.statics.updateSettings = async function(updates, userId) {
  const settings = await this.getInstance();
  Object.assign(settings, updates);
  settings.lastUpdatedBy = userId;
  return await settings.save();
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
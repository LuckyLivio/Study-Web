const mongoose = require('mongoose');

const externalLinkSchema = new mongoose.Schema({
  // 用户关联
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 链接标题
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // 链接URL
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: '请输入有效的URL地址'
    }
  },
  
  // 链接描述
  description: {
    type: String,
    maxlength: 200
  },
  
  // 链接分类
  category: {
    type: String,
    enum: ['社交媒体', '代码仓库', '学习平台', '工具网站', '个人主页', '其他'],
    default: '其他'
  },
  
  // 平台类型
  platform: {
    type: String,
    enum: ['GitHub', 'B站', 'Notion', '小红书', 'CSDN', '知乎', 'QQ', '微信', '微博', '抖音', '其他'],
    default: '其他'
  },
  
  // 图标（emoji或图标类名）
  icon: {
    type: String,
    default: '🔗'
  },
  
  // 显示顺序
  order: {
    type: Number,
    default: 0
  },
  
  // 是否启用
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 是否在新窗口打开
  openInNewTab: {
    type: Boolean,
    default: true
  },
  
  // 点击次数
  clickCount: {
    type: Number,
    default: 0
  },
  
  // 颜色主题
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

// 索引
externalLinkSchema.index({ category: 1 });
externalLinkSchema.index({ platform: 1 });
externalLinkSchema.index({ order: 1 });
externalLinkSchema.index({ isActive: 1 });

module.exports = mongoose.model('ExternalLink', externalLinkSchema);
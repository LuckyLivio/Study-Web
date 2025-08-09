const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // 基本信息
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // 用户关联（可选，支持匿名留言）
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // 留言类型
  type: {
    type: String,
    enum: ['建议', '反馈', '问题', '其他'],
    default: '其他'
  },
  
  // 是否匿名
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  // 联系方式（可选）
  contact: {
    email: String,
    qq: String,
    wechat: String
  },
  
  // 状态
  status: {
    type: String,
    enum: ['待处理', '处理中', '已回复', '已关闭'],
    default: '待处理'
  },
  
  // 是否公开显示
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // 管理员回复
  reply: {
    content: String,
    repliedAt: Date,
    repliedBy: String
  },
  
  // 点赞数
  likes: {
    type: Number,
    default: 0
  },
  
  // IP地址（用于防刷）
  ipAddress: String,
  
  // 标签
  tags: [String]
}, {
  timestamps: true
});

// 索引
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ isPublic: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
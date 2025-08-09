const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  reminderTime: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['一次性', '每日', '每周', '每月'],
    default: '一次性'
  },
  priority: {
    type: String,
    enum: ['低', '中', '高'],
    default: '中'
  },
  category: {
    type: String,
    enum: ['工作', '学习', '生活', '健康', '其他'],
    default: '其他'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  snoozeUntil: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
reminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = Date.now();
  } else if (!this.isCompleted) {
    this.completedAt = undefined;
  }
  next();
});

// 索引
reminderSchema.index({ reminderTime: 1 });
reminderSchema.index({ isActive: 1 });
reminderSchema.index({ isCompleted: 1 });
reminderSchema.index({ type: 1 });
reminderSchema.index({ category: 1 });
reminderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reminder', reminderSchema);
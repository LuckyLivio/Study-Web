const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['低', '中', '高'],
    default: '中'
  },
  category: {
    type: String,
    enum: ['工作', '学习', '生活', '其他'],
    default: '其他'
  },
  dueDate: {
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
  },
  completedAt: {
    type: Date
  }
});

// 更新时间中间件
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.completed && !this.completedAt) {
    this.completedAt = Date.now();
  } else if (!this.completed) {
    this.completedAt = undefined;
  }
  next();
});

// 索引
todoSchema.index({ createdAt: -1 });
todoSchema.index({ completed: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ category: 1 });
todoSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Todo', todoSchema);
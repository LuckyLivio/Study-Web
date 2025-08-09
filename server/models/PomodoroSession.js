const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['工作', '短休息', '长休息'],
    required: true
  },
  duration: {
    type: Number, // 持续时间（分钟）
    required: true
  },
  actualDuration: {
    type: Number, // 实际完成时间（分钟）
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  task: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['工作', '学习', '阅读', '编程', '其他'],
    default: '其他'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  pausedTime: {
    type: Number, // 暂停总时长（秒）
    default: 0
  },
  interruptions: {
    type: Number, // 中断次数
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 计算实际持续时间的方法
pomodoroSessionSchema.methods.calculateActualDuration = function() {
  if (this.endTime && this.startTime) {
    const totalMs = this.endTime - this.startTime;
    const totalMinutes = Math.floor(totalMs / (1000 * 60));
    const pausedMinutes = Math.floor(this.pausedTime / 60);
    this.actualDuration = Math.max(0, totalMinutes - pausedMinutes);
  }
  return this.actualDuration;
};

// 索引
pomodoroSessionSchema.index({ createdAt: -1 });
pomodoroSessionSchema.index({ type: 1 });
pomodoroSessionSchema.index({ category: 1 });
pomodoroSessionSchema.index({ isCompleted: 1 });
pomodoroSessionSchema.index({ startTime: 1 });

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);
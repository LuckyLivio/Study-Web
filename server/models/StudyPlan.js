const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
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
    maxlength: 1000
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['学习计划', '复习计划', '考试准备', '作业提醒', '其他'],
    default: '学习计划'
  },
  priority: {
    type: String,
    enum: ['低', '中', '高', '紧急'],
    default: '中'
  },
  status: {
    type: String,
    enum: ['未开始', '进行中', '已完成', '已延期', '已取消'],
    default: '未开始'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 1
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 200
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isSent: {
      type: Boolean,
      default: false
    }
  }],
  tasks: [{
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 300
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    estimatedMinutes: {
      type: Number,
      min: 0,
      default: 30
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建索引
studyPlanSchema.index({ subject: 1, status: 1 });
studyPlanSchema.index({ startDate: 1, endDate: 1 });
studyPlanSchema.index({ priority: 1, status: 1 });
studyPlanSchema.index({ 'reminders.date': 1, 'reminders.isActive': 1 });

// 虚拟字段：计算完成率
studyPlanSchema.virtual('completionRate').get(function() {
  if (this.tasks.length === 0) return this.progress;
  const completedTasks = this.tasks.filter(task => task.isCompleted).length;
  return Math.round((completedTasks / this.tasks.length) * 100);
});

// 虚拟字段：是否过期
studyPlanSchema.virtual('isOverdue').get(function() {
  return this.endDate < new Date() && this.status !== '已完成';
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
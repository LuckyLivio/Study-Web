const mongoose = require('mongoose');

// 课程模型
const courseSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  teacher: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  classroom: {
    type: String,
    trim: true,
    maxlength: 50
  },
  courseCode: {
    type: String,
    trim: true,
    maxlength: 20
  },
  credits: {
    type: Number,
    min: 0,
    max: 10,
    default: 1
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  color: {
    type: String,
    default: '#3B82F6', // 默认蓝色
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: '颜色格式不正确'
    }
  },
  // 课程评价
  rating: {
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    workload: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    interest: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    overall: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  review: {
    type: String,
    maxlength: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 课表时间段模型
const scheduleSlotSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // 0=周日, 1=周一, ..., 6=周六
    max: 6
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: '时间格式不正确 (HH:MM)'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: '时间格式不正确 (HH:MM)'
    }
  },
  weeks: [{
    type: Number,
    min: 1,
    max: 30 // 最多30周
  }],
  semester: {
    type: String,
    required: true,
    default: function() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      return month >= 9 || month <= 1 ? `${year}-${year + 1}-1` : `${year - 1}-${year}-2`;
    }
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// 课表模板模型（用于保存不同学期的课表）
const scheduleTemplateSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  semester: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  settings: {
    startTime: {
      type: String,
      default: '08:00'
    },
    endTime: {
      type: String,
      default: '22:00'
    },
    slotDuration: {
      type: Number,
      default: 45 // 每节课45分钟
    },
    breakDuration: {
      type: Number,
      default: 15 // 课间15分钟
    },
    showWeekends: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// 共享课表模型（用于多人课表比对）
const sharedScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  owner: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  semester: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  scheduleSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduleSlot'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  statistics: {
    totalCourses: {
      type: Number,
      default: 0
    },
    totalCredits: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    busyHours: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// 课表文件上传记录
const scheduleFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'excel'],
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// 创建索引
courseSchema.index({ name: 1, teacher: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ isActive: 1 });

scheduleSlotSchema.index({ semester: 1, dayOfWeek: 1 });
scheduleSlotSchema.index({ course: 1 });
scheduleSlotSchema.index({ startTime: 1, endTime: 1 });

scheduleTemplateSchema.index({ semester: 1 });
scheduleTemplateSchema.index({ isDefault: 1 });

scheduleFileSchema.index({ uploadDate: -1 });
scheduleFileSchema.index({ processed: 1 });

sharedScheduleSchema.index({ semester: 1 });
sharedScheduleSchema.index({ owner: 1 });
sharedScheduleSchema.index({ isPublic: 1 });
sharedScheduleSchema.index({ shareCode: 1 });

// 虚拟字段
courseSchema.virtual('averageRating').get(function() {
  const { difficulty, workload, interest, overall } = this.rating;
  return ((difficulty + workload + interest + overall) / 4).toFixed(1);
});

scheduleSlotSchema.virtual('duration').get(function() {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes - startMinutes;
});

// 中间件
scheduleSlotSchema.pre('save', function(next) {
  // 验证结束时间晚于开始时间
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('结束时间必须晚于开始时间'));
  } else {
    next();
  }
});

// 静态方法
courseSchema.statics.getPopularTags = async function() {
  const result = await this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
  return result.map(item => ({ tag: item._id, count: item.count }));
};

scheduleSlotSchema.statics.getWeeklySchedule = async function(semester, week) {
  return this.find({
    semester,
    weeks: { $in: [week] }
  }).populate('course').sort({ dayOfWeek: 1, startTime: 1 });
};

// 共享课表静态方法
sharedScheduleSchema.statics.generateShareCode = function() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

sharedScheduleSchema.statics.findByShareCode = async function(shareCode) {
  return this.findOne({ shareCode, isPublic: true })
    .populate('courses')
    .populate('scheduleSlots');
};

sharedScheduleSchema.methods.calculateStatistics = async function() {
  await this.populate('courses scheduleSlots');
  
  const totalCourses = this.courses.length;
  const totalCredits = this.courses.reduce((sum, course) => sum + (course.credits || 0), 0);
  const averageRating = this.courses.length > 0 
    ? this.courses.reduce((sum, course) => sum + (course.rating?.overall || 0), 0) / this.courses.length
    : 0;
  const busyHours = this.scheduleSlots.reduce((sum, slot) => {
    const start = slot.startTime.split(':').map(Number);
    const end = slot.endTime.split(':').map(Number);
    const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    return sum + (duration / 60) * (slot.weeks?.length || 1);
  }, 0);
  
  this.statistics = {
    totalCourses,
    totalCredits,
    averageRating: Math.round(averageRating * 10) / 10,
    busyHours: Math.round(busyHours * 10) / 10
  };
  
  return this.save();
};

const Course = mongoose.model('Course', courseSchema);
const ScheduleSlot = mongoose.model('ScheduleSlot', scheduleSlotSchema);
const ScheduleTemplate = mongoose.model('ScheduleTemplate', scheduleTemplateSchema);
const ScheduleFile = mongoose.model('ScheduleFile', scheduleFileSchema);
const SharedSchedule = mongoose.model('SharedSchedule', sharedScheduleSchema);

module.exports = {
  Course,
  ScheduleSlot,
  ScheduleTemplate,
  ScheduleFile,
  SharedSchedule
};
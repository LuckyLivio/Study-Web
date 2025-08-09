const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['课件', '教材', '习题集', '参考资料', '视频教程', '其他'],
    default: '其他'
  },
  fileInfo: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['入门', '基础', '中级', '高级'],
    default: '基础'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
studyMaterialSchema.index({ title: 'text', description: 'text', subject: 'text' });
studyMaterialSchema.index({ subject: 1, category: 1 });
studyMaterialSchema.index({ createdAt: -1 });
studyMaterialSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
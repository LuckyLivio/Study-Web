const mongoose = require('mongoose');

const studyNoteSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['课堂笔记', '复习总结', '知识点整理', '错题集', '其他'],
    default: '其他'
  },
  difficulty: {
    type: String,
    enum: ['简单', '中等', '困难'],
    default: '中等'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
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
studyNoteSchema.index({ title: 'text', content: 'text', subject: 'text' });
studyNoteSchema.index({ subject: 1, category: 1 });
studyNoteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StudyNote', studyNoteSchema);
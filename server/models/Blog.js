const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
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
  excerpt: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: '日记',
    enum: ['日记', '技术', '生活', '学习', '思考', '其他']
  },
  status: {
    type: String,
    default: '草稿',
    enum: ['草稿', '已发布', '私密']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    default: 'Admin'
  },
  publishedAt: {
    type: Date
  },
  featuredImage: {
    type: String
  },
  readingTime: {
    type: Number, // 预计阅读时间（分钟）
    default: 1
  }
}, {
  timestamps: true
});

// 索引
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ publishedAt: -1 });

// 虚拟字段：格式化的创建时间
blogSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('zh-CN');
});

// 虚拟字段：格式化的发布时间
blogSchema.virtual('formattedPublishedAt').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString('zh-CN') : null;
});

// 中间件：发布时设置发布时间
blogSchema.pre('save', function(next) {
  if (this.status === '已发布' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // 自动生成摘要
  if (!this.excerpt && this.content) {
    const plainText = this.content.replace(/[#*`_~\[\]()]/g, '').replace(/\n/g, ' ');
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  
  // 计算阅读时间（按每分钟200字计算）
  if (this.content) {
    const wordCount = this.content.length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  
  next();
});

// 静态方法：获取所有分类
blogSchema.statics.getCategories = function() {
  return this.schema.paths.category.enumValues;
};

// 静态方法：获取标签云
blogSchema.statics.getTagCloud = async function() {
  const result = await this.aggregate([
    { $match: { status: '已发布' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 50 }
  ]);
  return result.map(item => ({ tag: item._id, count: item.count }));
};

// 实例方法：增加浏览量
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// 实例方法：切换点赞
blogSchema.methods.toggleLike = function() {
  this.likes += 1;
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);
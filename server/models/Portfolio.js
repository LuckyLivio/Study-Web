const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
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
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['插画', '贴纸', '编程项目', '设计作品', '其他'],
    default: '插画'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 200
    },
    isMain: {
      type: Boolean,
      default: false
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  }],
  projectUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: '项目链接格式不正确'
    }
  },
  githubUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
      },
      message: 'GitHub链接格式不正确'
    }
  },
  technologies: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  status: {
    type: String,
    required: true,
    enum: ['进行中', '已完成', '暂停'],
    default: '进行中'
  },
  featured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: String, // 可以存储IP地址或用户ID
    trim: true
  }],
  sortOrder: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
portfolioSchema.index({ category: 1, status: 1 });
portfolioSchema.index({ featured: -1, createdAt: -1 });
portfolioSchema.index({ publishedAt: -1 });
portfolioSchema.index({ title: 'text', description: 'text', tags: 'text' });

// 虚拟字段
portfolioSchema.virtual('mainImage').get(function() {
  return this.images.find(img => img.isMain) || this.images[0] || null;
});

portfolioSchema.virtual('imageCount').get(function() {
  return this.images.length;
});

// 中间件：确保至少有一张主图
portfolioSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const hasMainImage = this.images.some(img => img.isMain);
    if (!hasMainImage) {
      this.images[0].isMain = true;
    }
    
    // 确保只有一张主图
    let mainImageSet = false;
    this.images.forEach(img => {
      if (img.isMain && !mainImageSet) {
        mainImageSet = true;
      } else if (img.isMain && mainImageSet) {
        img.isMain = false;
      }
    });
  }
  next();
});

// 静态方法：获取分类统计
portfolioSchema.statics.getCategoryStats = function() {
  return this.aggregate([
    {
      $match: { isPublished: true }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        featured: {
          $sum: {
            $cond: ['$featured', 1, 0]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// 静态方法：获取热门标签
portfolioSchema.statics.getPopularTags = function(limit = 20) {
  return this.aggregate([
    {
      $match: { isPublished: true }
    },
    {
      $unwind: '$tags'
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// 实例方法：增加浏览量
portfolioSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

// 实例方法：切换点赞状态
portfolioSchema.methods.toggleLike = function(identifier) {
  const index = this.likedBy.indexOf(identifier);
  if (index > -1) {
    // 取消点赞
    this.likedBy.splice(index, 1);
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    // 点赞
    this.likedBy.push(identifier);
    this.likeCount += 1;
  }
  return this.save();
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
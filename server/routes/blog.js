const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { upload } = require('../middleware/upload');

// 获取博客列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      tags = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 构建查询条件
    const query = {};
    
    // 搜索条件
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // 分类筛选
    if (category) {
      query.category = category;
    }
    
    // 状态筛选
    if (status) {
      query.status = status;
    } else {
      // 默认只显示已发布的文章
      query.status = '已发布';
    }
    
    // 标签筛选
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // 排序
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const blogs = await Blog.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // 列表页不返回完整内容
    
    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          current: parseInt(page),
          total: totalPages,
          count: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('获取博客列表失败:', error);
    res.status(500).json({ success: false, message: '获取博客列表失败' });
  }
});

// 获取单个博客详情
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    // 增加浏览量
    await blog.incrementViews();
    
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('获取博客详情失败:', error);
    res.status(500).json({ success: false, message: '获取博客详情失败' });
  }
});

// 创建博客
router.post('/', upload.single('featuredImage'), async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []),
      category: req.body.category || '日记'
    };
    
    if (req.file) {
      blogData.featuredImage = `/uploads/${req.file.filename}`;
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('创建博客失败:', error);
    res.status(500).json({ success: false, message: '创建博客失败' });
  }
});

// 更新博客
router.put('/:id', upload.single('featuredImage'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      tags: Array.isArray(req.body.tags) ? req.body.tags : (req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []),
      category: req.body.category || '日记'
    };
    
    if (req.file) {
      updateData.featuredImage = `/uploads/${req.file.filename}`;
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error('更新博客失败:', error);
    res.status(500).json({ success: false, message: '更新博客失败' });
  }
});

// 删除博客
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    res.json({ success: true, message: '博客删除成功' });
  } catch (error) {
    console.error('删除博客失败:', error);
    res.status(500).json({ success: false, message: '删除博客失败' });
  }
});

// 点赞博客
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: '博客不存在' });
    }
    
    await blog.toggleLike();
    res.json({ success: true, data: { likes: blog.likes } });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, message: '点赞失败' });
  }
});

// 获取分类列表
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = Blog.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ success: false, message: '获取分类失败' });
  }
});

// 获取标签云
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await Blog.getTagCloud();
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error('获取标签云失败:', error);
    res.status(500).json({ success: false, message: '获取标签云失败' });
  }
});

// 获取博客统计
router.get('/meta/stats', async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ status: '已发布' });
    const totalViews = await Blog.aggregate([
      { $match: { status: '已发布' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalLikes = await Blog.aggregate([
      { $match: { status: '已发布' } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);
    
    const categoryStats = await Blog.aggregate([
      { $match: { status: '已发布' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        categoryStats
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

module.exports = router;

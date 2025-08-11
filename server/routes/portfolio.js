const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { upload, handleUploadError, cleanupFiles, deleteFile, getFileUrl } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// 所有作品集路由都需要认证
router.use(authenticate);

// 获取作品列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      featured,
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // 构建查询条件
    const query = { isPublished: true };
    
    if (category && category !== '全部') {
      query.category = category;
    }
    
    if (status && status !== '全部') {
      query.status = status;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // 构建排序
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // 如果按相关性排序（搜索时）
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }

    // 分页计算
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 执行查询
    const [portfolios, total] = await Promise.all([
      Portfolio.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Portfolio.countDocuments(query)
    ]);

    // 处理图片URL
    const processedPortfolios = portfolios.map(portfolio => ({
      ...portfolio,
      images: portfolio.images.map(img => ({
        ...img,
        url: getFileUrl(img.filename)
      }))
    }));

    res.json({
      success: true,
      data: processedPortfolios,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('获取作品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取作品列表失败'
    });
  }
});

// 获取单个作品详情
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 处理图片URL
    const processedPortfolio = {
      ...portfolio.toObject(),
      images: portfolio.images.map(img => ({
        ...img,
        url: getFileUrl(img.filename)
      }))
    };

    res.json({
      success: true,
      data: processedPortfolio
    });
  } catch (error) {
    console.error('获取作品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取作品详情失败'
    });
  }
});

// 创建作品
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      featured,
      projectUrl,
      githubUrl,
      existingImages
    } = req.body;

    // 处理标签和技术栈
    const tags = req.body['tags[]'] ? 
      (Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']]) : [];
    const technologies = req.body['technologies[]'] ? 
      (Array.isArray(req.body['technologies[]']) ? req.body['technologies[]'] : [req.body['technologies[]']]) : [];

    // 验证必填字段
    if (!title || !description) {
      cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: '标题和描述为必填项'
      });
    }

    // 处理图片
    const images = [];
    
    // 处理现有图片（如果有）
    if (existingImages) {
      try {
        const existing = JSON.parse(existingImages);
        images.push(...existing);
      } catch (err) {
        console.error('解析现有图片失败:', err);
      }
    }
    
    // 处理新上传的图片
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const caption = req.body[`imageCaption_${index}`] || '';
        const isMain = req.body[`imageIsMain_${index}`] === 'true';
        
        images.push({
          url: getFileUrl(file.filename),
          caption,
          isMain,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        });
      });
    }

    // 创建作品
    const portfolio = new Portfolio({
      title: title.trim(),
      description: description.trim(),
      category: category || '插画',
      tags: tags.filter(tag => tag.trim()),
      images,
      projectUrl: projectUrl?.trim() || undefined,
      githubUrl: githubUrl?.trim() || undefined,
      technologies: technologies.filter(tech => tech.trim()),
      status: status || '进行中',
      featured: featured === 'true'
    });

    await portfolio.save();

    // 处理返回的图片URL
    const savedPortfolio = {
      ...portfolio.toObject(),
      images: portfolio.images.map(img => ({
        ...img,
        url: getFileUrl(img.filename)
      }))
    };

    res.status(201).json({
      success: true,
      data: savedPortfolio,
      message: '作品创建成功'
    });
  } catch (error) {
    console.error('创建作品失败:', error);
    cleanupFiles(req.files);
    res.status(500).json({
      success: false,
      message: '创建作品失败'
    });
  }
}, handleUploadError);

// 更新作品
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      cleanupFiles(req.files);
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    const {
      title,
      description,
      category,
      status,
      featured,
      projectUrl,
      githubUrl,
      existingImages
    } = req.body;

    // 处理标签和技术栈
    const tags = req.body['tags[]'] ? 
      (Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']]) : [];
    const technologies = req.body['technologies[]'] ? 
      (Array.isArray(req.body['technologies[]']) ? req.body['technologies[]'] : [req.body['technologies[]']]) : [];

    // 验证必填字段
    if (!title || !description) {
      cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: '标题和描述为必填项'
      });
    }

    // 处理图片更新
    const oldImages = [...portfolio.images];
    const newImages = [];
    
    // 处理保留的现有图片
    if (existingImages) {
      try {
        const existing = JSON.parse(existingImages);
        newImages.push(...existing);
      } catch (err) {
        console.error('解析现有图片失败:', err);
      }
    }
    
    // 处理新上传的图片
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const caption = req.body[`imageCaption_${index}`] || '';
        const isMain = req.body[`imageIsMain_${index}`] === 'true';
        
        newImages.push({
          url: getFileUrl(file.filename),
          caption,
          isMain,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        });
      });
    }

    // 删除不再使用的图片文件
    const oldFilenames = oldImages.map(img => img.filename);
    const newFilenames = newImages.map(img => img.filename);
    const filesToDelete = oldFilenames.filter(filename => !newFilenames.includes(filename));
    
    filesToDelete.forEach(filename => {
      deleteFile(filename);
    });

    // 更新作品信息
    portfolio.title = title.trim();
    portfolio.description = description.trim();
    portfolio.category = category || portfolio.category;
    portfolio.tags = tags.filter(tag => tag.trim());
    portfolio.images = newImages;
    portfolio.projectUrl = projectUrl?.trim() || undefined;
    portfolio.githubUrl = githubUrl?.trim() || undefined;
    portfolio.technologies = technologies.filter(tech => tech.trim());
    portfolio.status = status || portfolio.status;
    portfolio.featured = featured === 'true';

    await portfolio.save();

    // 处理返回的图片URL
    const updatedPortfolio = {
      ...portfolio.toObject(),
      images: portfolio.images.map(img => ({
        ...img,
        url: getFileUrl(img.filename)
      }))
    };

    res.json({
      success: true,
      data: updatedPortfolio,
      message: '作品更新成功'
    });
  } catch (error) {
    console.error('更新作品失败:', error);
    cleanupFiles(req.files);
    res.status(500).json({
      success: false,
      message: '更新作品失败'
    });
  }
}, handleUploadError);

// 删除作品
router.delete('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 删除相关的图片文件
    portfolio.images.forEach(img => {
      deleteFile(img.filename);
    });

    await Portfolio.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '作品删除成功'
    });
  } catch (error) {
    console.error('删除作品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除作品失败'
    });
  }
});

// 切换精选状态
router.patch('/:id/featured', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    portfolio.featured = !portfolio.featured;
    await portfolio.save();

    res.json({
      success: true,
      data: portfolio,
      message: `已${portfolio.featured ? '设为' : '取消'}精选`
    });
  } catch (error) {
    console.error('切换精选状态失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 增加浏览量
router.patch('/:id/view', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    await portfolio.incrementView();

    res.json({
      success: true,
      message: '浏览量已更新'
    });
  } catch (error) {
    console.error('更新浏览量失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 点赞/取消点赞
router.patch('/:id/like', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: '作品不存在'
      });
    }

    // 使用IP地址作为标识符
    const identifier = req.ip || req.connection.remoteAddress || 'anonymous';
    await portfolio.toggleLike(identifier);

    res.json({
      success: true,
      data: portfolio,
      message: '操作成功'
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// 获取分类统计
router.get('/stats/categories', async (req, res) => {
  try {
    const stats = await Portfolio.getCategoryStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

// 获取热门标签
router.get('/stats/tags', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const tags = await Portfolio.getPopularTags(parseInt(limit));
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(500).json({
      success: false,
      message: '获取标签数据失败'
    });
  }
});

module.exports = router;
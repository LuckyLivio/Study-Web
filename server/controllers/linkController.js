const ExternalLink = require('../models/ExternalLink');

// 外部链接控制器
const linkController = {
  // 获取所有链接
  async getAllLinks(req, res) {
    try {
      const {
        category = '',
        platform = '',
        isActive
      } = req.query;

      const query = {
        author: req.user._id // 只查询当前用户的链接
      };
      
      if (category) query.category = category;
      if (platform) query.platform = platform;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const links = await ExternalLink.find(query)
        .sort({ order: 1, createdAt: -1 });

      res.json({
        success: true,
        data: links
      });
    } catch (error) {
      console.error('获取链接失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取公开链接（前端展示用）
  async getPublicLinks(req, res) {
    try {
      const { category = '', platform = '' } = req.query;

      const query = { isActive: true };
      
      if (category) query.category = category;
      if (platform) query.platform = platform;

      const links = await ExternalLink.find(query)
        .select('-clickCount') // 不返回点击统计
        .sort({ order: 1, createdAt: -1 });

      // 按分类分组
      const groupedLinks = links.reduce((acc, link) => {
        const category = link.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(link);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          all: links,
          grouped: groupedLinks
        }
      });
    } catch (error) {
      console.error('获取公开链接失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 创建链接
  async createLink(req, res) {
    try {
      const linkData = {
        ...req.body,
        author: req.user._id // 添加作者ID
      };
      const link = new ExternalLink(linkData);
      await link.save();
      
      res.status(201).json({ success: true, data: link });
    } catch (error) {
      console.error('创建链接失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 更新链接
  async updateLink(req, res) {
    try {
      const link = await ExternalLink.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!link) {
        return res.status(404).json({ success: false, message: '链接不存在' });
      }
      
      res.json({ success: true, data: link });
    } catch (error) {
      console.error('更新链接失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 删除链接
  async deleteLink(req, res) {
    try {
      const link = await ExternalLink.findOneAndDelete({ _id: req.params.id, author: req.user._id });
      if (!link) {
        return res.status(404).json({ success: false, message: '链接不存在' });
      }
      
      res.json({ success: true, message: '链接删除成功' });
    } catch (error) {
      console.error('删除链接失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 记录点击
  async recordClick(req, res) {
    try {
      const link = await ExternalLink.findByIdAndUpdate(
        req.params.id,
        { $inc: { clickCount: 1 } },
        { new: true }
      );
      
      if (!link) {
        return res.status(404).json({ success: false, message: '链接不存在' });
      }
      
      res.json({ success: true, data: { clickCount: link.clickCount } });
    } catch (error) {
      console.error('记录点击失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 批量更新排序
  async updateOrder(req, res) {
    try {
      const { links } = req.body; // [{ id, order }, ...]
      
      const updatePromises = links.map(({ id, order }) => 
        ExternalLink.findOneAndUpdate(
          { _id: id, author: req.user._id },
          { order }
        )
      );
      
      await Promise.all(updatePromises);
      
      res.json({ success: true, message: '排序更新成功' });
    } catch (error) {
      console.error('更新排序失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取链接统计
  async getLinkStats(req, res) {
    try {
      const userFilter = { author: req.user._id };
      const totalLinks = await ExternalLink.countDocuments(userFilter);
      const activeLinks = await ExternalLink.countDocuments({ ...userFilter, isActive: true });
      
      // 按分类统计
      const categoryStats = await ExternalLink.aggregate([
        { $match: userFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      // 按平台统计
      const platformStats = await ExternalLink.aggregate([
        { $match: userFilter },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]);
      
      // 点击统计
      const clickStats = await ExternalLink.aggregate([
        { $match: userFilter },
        { $group: { _id: null, totalClicks: { $sum: '$clickCount' } } }
      ]);
      
      res.json({
        success: true,
        data: {
          total: totalLinks,
          active: activeLinks,
          totalClicks: clickStats[0]?.totalClicks || 0,
          byCategory: categoryStats,
          byPlatform: platformStats
        }
      });
    } catch (error) {
      console.error('获取链接统计失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取分类和平台列表
  async getMetadata(req, res) {
    try {
      const categories = await ExternalLink.distinct('category');
      const platforms = await ExternalLink.distinct('platform');
      
      res.json({
        success: true,
        data: {
          categories,
          platforms
        }
      });
    } catch (error) {
      console.error('获取元数据失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

module.exports = linkController;
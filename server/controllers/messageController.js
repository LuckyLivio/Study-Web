const Message = require('../models/Message');

// 留言控制器
const messageController = {
  // 获取所有留言（公开的）
  async getPublicMessages(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        type = '',
        search = ''
      } = req.query;

      const query = { isPublic: true };
      
      if (type) query.type = type;
      if (search) {
        query.$or = [
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Message.countDocuments(query);
      
      const messages = await Message.find(query)
        .select('-ipAddress -contact') // 不返回敏感信息
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取留言失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取所有留言（管理员）
  async getAllMessages(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        type = '',
        status = '',
        search = ''
      } = req.query;

      const query = {};
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Message.countDocuments(query);
      
      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: messages,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取留言失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 创建留言
  async createMessage(req, res) {
    try {
      const messageData = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress
      };
      
      // 处理标签
      if (messageData.tags && typeof messageData.tags === 'string') {
        messageData.tags = JSON.parse(messageData.tags);
      }
      
      const message = new Message(messageData);
      await message.save();
      
      // 返回时不包含敏感信息
      const responseMessage = message.toObject();
      delete responseMessage.ipAddress;
      if (responseMessage.isAnonymous) {
        delete responseMessage.contact;
      }
      
      res.status(201).json({ success: true, data: responseMessage });
    } catch (error) {
      console.error('创建留言失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 回复留言（管理员）
  async replyMessage(req, res) {
    try {
      const { content } = req.body;
      const messageId = req.params.id;
      
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          reply: {
            content,
            repliedAt: new Date(),
            repliedBy: 'Admin' // 可以根据实际情况修改
          },
          status: '已回复'
        },
        { new: true }
      );
      
      if (!message) {
        return res.status(404).json({ success: false, message: '留言不存在' });
      }
      
      res.json({ success: true, data: message });
    } catch (error) {
      console.error('回复留言失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 更新留言状态
  async updateMessageStatus(req, res) {
    try {
      const { status, isPublic } = req.body;
      const messageId = req.params.id;
      
      const updateData = {};
      if (status) updateData.status = status;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      
      const message = await Message.findByIdAndUpdate(
        messageId,
        updateData,
        { new: true }
      );
      
      if (!message) {
        return res.status(404).json({ success: false, message: '留言不存在' });
      }
      
      res.json({ success: true, data: message });
    } catch (error) {
      console.error('更新留言状态失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 点赞留言
  async likeMessage(req, res) {
    try {
      const messageId = req.params.id;
      
      const message = await Message.findByIdAndUpdate(
        messageId,
        { $inc: { likes: 1 } },
        { new: true }
      );
      
      if (!message) {
        return res.status(404).json({ success: false, message: '留言不存在' });
      }
      
      res.json({ success: true, data: { likes: message.likes } });
    } catch (error) {
      console.error('点赞留言失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 删除留言
  async deleteMessage(req, res) {
    try {
      const message = await Message.findByIdAndDelete(req.params.id);
      if (!message) {
        return res.status(404).json({ success: false, message: '留言不存在' });
      }
      
      res.json({ success: true, message: '留言删除成功' });
    } catch (error) {
      console.error('删除留言失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取留言统计
  async getMessageStats(req, res) {
    try {
      const totalMessages = await Message.countDocuments();
      const publicMessages = await Message.countDocuments({ isPublic: true });
      const pendingMessages = await Message.countDocuments({ status: '待处理' });
      const repliedMessages = await Message.countDocuments({ status: '已回复' });
      
      // 按类型统计
      const typeStats = await Message.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      res.json({
        success: true,
        data: {
          total: totalMessages,
          public: publicMessages,
          pending: pendingMessages,
          replied: repliedMessages,
          byType: typeStats
        }
      });
    } catch (error) {
      console.error('获取留言统计失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

module.exports = messageController;
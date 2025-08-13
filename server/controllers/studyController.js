const StudyNote = require('../models/StudyNote');
const StudyMaterial = require('../models/StudyMaterial');
const StudyPlan = require('../models/StudyPlan');
const path = require('path');
const fs = require('fs');

// 学习笔记控制器
const studyNoteController = {
  // 获取所有笔记
  async getAllNotes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        subject = '',
        category = '',
        difficulty = '',
        isPublic
      } = req.query;

      const query = {
        author: req.user._id // 只查询当前用户的笔记
      };
      
      // 搜索条件
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (subject) query.subject = subject;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (isPublic !== undefined) query.isPublic = isPublic === 'true';

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await StudyNote.countDocuments(query);
      
      const notes = await StudyNote.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: notes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取笔记失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 根据ID获取笔记
  async getNoteById(req, res) {
    try {
      const note = await StudyNote.findById(req.params.id);
      if (!note) {
        return res.status(404).json({ success: false, message: '笔记不存在' });
      }
      
      // 增加浏览次数
      note.viewCount += 1;
      await note.save();
      
      res.json({ success: true, data: note });
    } catch (error) {
      console.error('获取笔记失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 创建笔记
  async createNote(req, res) {
    try {
      const noteData = {
        ...req.body,
        author: req.user._id, // 设置作者为当前用户
        attachments: req.files ? req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        })) : []
      };
      
      if (noteData.tags && typeof noteData.tags === 'string') {
        noteData.tags = JSON.parse(noteData.tags);
      }
      
      const note = new StudyNote(noteData);
      await note.save();
      
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      console.error('创建笔记失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 更新笔记
  async updateNote(req, res) {
    try {
      const updateData = { ...req.body };
      
      if (req.files && req.files.length > 0) {
        updateData.attachments = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        }));
      }
      
      if (updateData.tags && typeof updateData.tags === 'string') {
        updateData.tags = JSON.parse(updateData.tags);
      }
      
      const note = await StudyNote.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id }, // 只允许更新自己的笔记
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!note) {
        return res.status(404).json({ success: false, message: '笔记不存在' });
      }
      
      res.json({ success: true, data: note });
    } catch (error) {
      console.error('更新笔记失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 删除笔记
  async deleteNote(req, res) {
    try {
      const note = await StudyNote.findOneAndDelete({ _id: req.params.id, author: req.user._id }); // 只允许删除自己的笔记
      if (!note) {
        return res.status(404).json({ success: false, message: '笔记不存在' });
      }
      
      // 删除相关文件
      if (note.attachments && note.attachments.length > 0) {
        note.attachments.forEach(attachment => {
          const filePath = path.join(__dirname, '..', attachment.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      
      res.json({ success: true, message: '笔记删除成功' });
    } catch (error) {
      console.error('删除笔记失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取公开笔记
  async getPublicNotes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        subject = '',
        category = '',
        difficulty = ''
      } = req.query;

      const query = {
        isPublic: true // 只查询公开的笔记
      };
      
      // 搜索条件
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (subject) query.subject = subject;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await StudyNote.countDocuments(query);
      
      const notes = await StudyNote.find(query)
        .select('-attachments') // 不返回附件信息
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: notes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取公开笔记失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

// 学习资料控制器
const studyMaterialController = {
  // 获取所有资料
  async getAllMaterials(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
        subject = '',
        category = '',
        difficulty = '',
        isPublic
      } = req.query;

      const query = {
        author: req.user._id // 只查询当前用户的资料
      };
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (subject) query.subject = subject;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (isPublic !== undefined) query.isPublic = isPublic === 'true';

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await StudyMaterial.countDocuments(query);
      
      const materials = await StudyMaterial.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: materials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取资料失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 上传资料
  async uploadMaterial(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择文件' });
      }
      
      const materialData = {
        ...req.body,
        author: req.user._id, // 设置作者为当前用户
        fileInfo: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      };
      
      if (materialData.tags && typeof materialData.tags === 'string') {
        materialData.tags = JSON.parse(materialData.tags);
      }
      
      if (materialData.isPublic && typeof materialData.isPublic === 'string') {
        materialData.isPublic = materialData.isPublic === 'true';
      }
      
      const material = new StudyMaterial(materialData);
      await material.save();
      
      res.status(201).json({ success: true, data: material });
    } catch (error) {
      console.error('上传资料失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 下载资料
  async downloadMaterial(req, res) {
    try {
      const material = await StudyMaterial.findById(req.params.id);
      if (!material) {
        return res.status(404).json({ success: false, message: '资料不存在' });
      }
      
      const filePath = path.join(__dirname, '..', material.fileInfo.path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
      }
      
      // 增加下载次数
      material.downloadCount += 1;
      await material.save();
      
      res.download(filePath, material.fileInfo.originalName);
    } catch (error) {
      console.error('下载资料失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 删除资料
  async deleteMaterial(req, res) {
    try {
      const material = await StudyMaterial.findOneAndDelete({ _id: req.params.id, author: req.user._id }); // 只允许删除自己的资料
      if (!material) {
        return res.status(404).json({ success: false, message: '资料不存在' });
      }
      
      // 删除文件
      const filePath = path.join(__dirname, '..', material.fileInfo.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      res.json({ success: true, message: '资料删除成功' });
    } catch (error) {
      console.error('删除资料失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取公开资料
  async getPublicMaterials(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
        subject = '',
        category = '',
        difficulty = ''
      } = req.query;

      const query = {
        isPublic: true // 只查询公开的资料
      };
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (subject) query.subject = subject;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await StudyMaterial.countDocuments(query);
      
      const materials = await StudyMaterial.find(query)
        .select('-fileInfo.path') // 不返回文件路径信息
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: materials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取公开资料失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

// 学习计划控制器
const studyPlanController = {
  // 获取所有计划
  async getAllPlans(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        priority = '',
        type = ''
      } = req.query;

      const query = {
        author: req.user._id // 只查询当前用户的计划
      };
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (type) query.type = type;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await StudyPlan.countDocuments(query);
      
      const plans = await StudyPlan.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: plans,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (error) {
      console.error('获取计划失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 创建计划
  async createPlan(req, res) {
    try {
      const plan = new StudyPlan({ ...req.body, author: req.user._id }); // 设置作者为当前用户
      await plan.save();
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      console.error('创建计划失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 更新计划
  async updatePlan(req, res) {
    try {
      const plan = await StudyPlan.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id }, // 只允许更新自己的计划
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!plan) {
        return res.status(404).json({ success: false, message: '计划不存在' });
      }
      
      res.json({ success: true, data: plan });
    } catch (error) {
      console.error('更新计划失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 更新任务状态
  async updateTaskStatus(req, res) {
    try {
      const { taskIndex, completed } = req.body;
      const plan = await StudyPlan.findOne({ _id: req.params.id, author: req.user._id }); // 只允许更新自己的计划
      
      if (!plan) {
        return res.status(404).json({ success: false, message: '计划不存在' });
      }
      
      if (taskIndex < 0 || taskIndex >= plan.tasks.length) {
        return res.status(400).json({ success: false, message: '任务索引无效' });
      }
      
      // 如果提供了completed参数，使用它；否则切换状态
      if (completed !== undefined) {
        plan.tasks[taskIndex].completed = completed;
      } else {
        plan.tasks[taskIndex].completed = !plan.tasks[taskIndex].completed;
      }
      
      // 重新计算进度
      const completedTasks = plan.tasks.filter(task => task.completed).length;
      plan.progress = plan.tasks.length > 0 ? Math.round((completedTasks / plan.tasks.length) * 100) : 0;
      
      // 如果所有任务完成，更新计划状态
      if (plan.progress === 100) {
        plan.status = '已完成';
      } else if (plan.progress > 0 && plan.status === '未开始') {
        plan.status = '进行中';
      }
      
      await plan.save();
      
      res.json({ success: true, data: plan });
    } catch (error) {
      console.error('更新任务状态失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 删除计划
  async deletePlan(req, res) {
    try {
      const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, author: req.user._id }); // 只允许删除自己的计划
      if (!plan) {
        return res.status(404).json({ success: false, message: '计划不存在' });
      }
      
      res.json({ success: true, message: '计划删除成功' });
    } catch (error) {
      console.error('删除计划失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  // 获取即将到来的提醒
  async getUpcomingReminders(req, res) {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const plans = await StudyPlan.find({
        author: req.user._id, // 只查询当前用户的计划
        status: { $in: ['未开始', '进行中'] },
        'reminders.date': {
          $gte: now,
          $lte: nextWeek
        }
      }).sort({ 'reminders.date': 1 });
      
      const reminders = [];
      plans.forEach(plan => {
        plan.reminders.forEach(reminder => {
          const reminderDate = new Date(reminder.date);
          if (reminderDate >= now && reminderDate <= nextWeek) {
            reminders.push({
              planId: plan._id,
              planTitle: plan.title,
              date: reminder.date,
              message: reminder.message
            });
          }
        });
      });
      
      reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      res.json({ success: true, data: reminders });
    } catch (error) {
      console.error('获取提醒失败:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

module.exports = {
  studyNoteController,
  studyMaterialController,
  studyPlanController
};
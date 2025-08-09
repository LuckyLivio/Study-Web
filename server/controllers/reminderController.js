const Reminder = require('../models/Reminder');

// 获取所有提醒事项
exports.getReminders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      isCompleted, 
      type, 
      category, 
      search,
      sortBy = 'reminderTime',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    // 筛选条件
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === 'true';
    }
    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 排序
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reminders = await Reminder.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Reminder.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reminders,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: reminders.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取提醒事项失败',
      error: error.message
    });
  }
};

// 获取即将到来的提醒
exports.getUpcomingReminders = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      reminderTime: { $gte: now, $lte: futureTime },
      isActive: true,
      isCompleted: false,
      $or: [
        { snoozeUntil: { $exists: false } },
        { snoozeUntil: { $lte: now } }
      ]
    })
    .sort({ reminderTime: 1 })
    .limit(50);

    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取即将到来的提醒失败',
      error: error.message
    });
  }
};

// 创建提醒事项
exports.createReminder = async (req, res) => {
  try {
    const { title, description, reminderTime, type, priority, category, tags } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '标题不能为空'
      });
    }

    if (!reminderTime) {
      return res.status(400).json({
        success: false,
        message: '提醒时间不能为空'
      });
    }

    const reminder = new Reminder({
      title: title.trim(),
      description: description?.trim(),
      reminderTime: new Date(reminderTime),
      type,
      priority,
      category,
      tags: tags || []
    });

    await reminder.save();

    res.status(201).json({
      success: true,
      message: '提醒事项创建成功',
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建提醒事项失败',
      error: error.message
    });
  }
};

// 更新提醒事项
exports.updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 不允许直接更新的字段
    delete updates.createdAt;
    delete updates._id;

    if (updates.reminderTime) {
      updates.reminderTime = new Date(updates.reminderTime);
    }

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: '提醒事项不存在'
      });
    }

    res.json({
      success: true,
      message: '提醒事项更新成功',
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新提醒事项失败',
      error: error.message
    });
  }
};

// 完成提醒
exports.completeReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: '提醒事项不存在'
      });
    }

    reminder.isCompleted = true;
    reminder.completedAt = new Date();
    await reminder.save();

    res.json({
      success: true,
      message: '提醒已完成',
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '完成提醒失败',
      error: error.message
    });
  }
};

// 延迟提醒
exports.snoozeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { minutes = 10 } = req.body;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: '提醒事项不存在'
      });
    }

    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    reminder.snoozeUntil = snoozeUntil;
    await reminder.save();

    res.json({
      success: true,
      message: `提醒已延迟 ${minutes} 分钟`,
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '延迟提醒失败',
      error: error.message
    });
  }
};

// 删除提醒事项
exports.deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByIdAndDelete(id);
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: '提醒事项不存在'
      });
    }

    res.json({
      success: true,
      message: '提醒事项删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除提醒事项失败',
      error: error.message
    });
  }
};

// 获取统计信息
exports.getReminderStats = async (req, res) => {
  try {
    const total = await Reminder.countDocuments({ isActive: true });
    const completed = await Reminder.countDocuments({ isCompleted: true, isActive: true });
    const pending = total - completed;
    
    // 今日提醒
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await Reminder.countDocuments({
      reminderTime: { $gte: today, $lt: tomorrow },
      isActive: true,
      isCompleted: false
    });

    // 逾期提醒
    const now = new Date();
    const overdueCount = await Reminder.countDocuments({
      reminderTime: { $lt: now },
      isActive: true,
      isCompleted: false,
      $or: [
        { snoozeUntil: { $exists: false } },
        { snoozeUntil: { $lte: now } }
      ]
    });

    // 类型统计
    const typeStats = await Reminder.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const categoryStats = await Reminder.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        today: todayCount,
        overdue: overdueCount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        typeStats,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
};
const PomodoroSession = require('../models/PomodoroSession');

// 获取番茄钟会话记录
exports.getSessions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      category, 
      isCompleted,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // 筛选条件
    if (type) {
      filter.type = type;
    }
    if (category) {
      filter.category = category;
    }
    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === 'true';
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) {
        filter.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.startTime.$lte = end;
      }
    }

    // 排序
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sessions = await PomodoroSession.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await PomodoroSession.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: sessions.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取会话记录失败',
      error: error.message
    });
  }
};

// 开始新的番茄钟会话
exports.startSession = async (req, res) => {
  try {
    const { type, duration, task, category } = req.body;

    if (!type || !duration) {
      return res.status(400).json({
        success: false,
        message: '会话类型和持续时间不能为空'
      });
    }

    const session = new PomodoroSession({
      type,
      duration,
      task: task?.trim(),
      category,
      startTime: new Date()
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: '番茄钟会话已开始',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '开始会话失败',
      error: error.message
    });
  }
};

// 完成番茄钟会话
exports.completeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, interruptions = 0, pausedTime = 0 } = req.body;

    const session = await PomodoroSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '会话不存在'
      });
    }

    if (session.isCompleted) {
      return res.status(400).json({
        success: false,
        message: '会话已经完成'
      });
    }

    session.endTime = new Date();
    session.isCompleted = true;
    session.notes = notes?.trim();
    session.interruptions = interruptions;
    session.pausedTime = pausedTime;
    session.calculateActualDuration();

    await session.save();

    res.json({
      success: true,
      message: '番茄钟会话已完成',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '完成会话失败',
      error: error.message
    });
  }
};

// 取消番茄钟会话
exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const session = await PomodoroSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '会话不存在'
      });
    }

    if (session.isCompleted) {
      return res.status(400).json({
        success: false,
        message: '已完成的会话无法取消'
      });
    }

    session.endTime = new Date();
    session.isCompleted = false;
    session.notes = reason ? `取消原因: ${reason}` : '会话已取消';
    session.calculateActualDuration();

    await session.save();

    res.json({
      success: true,
      message: '番茄钟会话已取消',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取消会话失败',
      error: error.message
    });
  }
};

// 更新会话信息
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 不允许直接更新的字段
    delete updates.startTime;
    delete updates.endTime;
    delete updates.actualDuration;
    delete updates._id;

    const session = await PomodoroSession.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '会话不存在'
      });
    }

    res.json({
      success: true,
      message: '会话信息更新成功',
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新会话失败',
      error: error.message
    });
  }
};

// 删除会话
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await PomodoroSession.findByIdAndDelete(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '会话不存在'
      });
    }

    res.json({
      success: true,
      message: '会话删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除会话失败',
      error: error.message
    });
  }
};

// 获取统计信息
exports.getPomodoroStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year
    
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    startDate.setHours(0, 0, 0, 0);

    // 基础统计
    const totalSessions = await PomodoroSession.countDocuments({
      startTime: { $gte: startDate }
    });
    
    const completedSessions = await PomodoroSession.countDocuments({
      startTime: { $gte: startDate },
      isCompleted: true
    });

    // 总专注时间
    const focusTimeResult = await PomodoroSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          isCompleted: true,
          type: '工作'
        }
      },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$actualDuration' }
        }
      }
    ]);
    
    const totalFocusTime = focusTimeResult[0]?.totalMinutes || 0;

    // 按类型统计
    const typeStats = await PomodoroSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalTime: { $sum: '$actualDuration' },
          completedCount: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          }
        }
      }
    ]);

    // 按分类统计
    const categoryStats = await PomodoroSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          type: '工作'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalTime: { $sum: '$actualDuration' }
        }
      }
    ]);

    // 每日统计（最近7天）
    const dailyStats = await PomodoroSession.aggregate([
      {
        $match: {
          startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          sessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          focusTime: {
            $sum: {
              $cond: [
                { $and: ['$isCompleted', { $eq: ['$type', '工作'] }] },
                '$actualDuration',
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // 平均中断次数
    const interruptionResult = await PomodoroSession.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          isCompleted: true
        }
      },
      {
        $group: {
          _id: null,
          avgInterruptions: { $avg: '$interruptions' }
        }
      }
    ]);

    const avgInterruptions = interruptionResult[0]?.avgInterruptions || 0;

    res.json({
      success: true,
      data: {
        period,
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        totalFocusTime, // 分钟
        totalFocusHours: Math.round(totalFocusTime / 60 * 10) / 10, // 小时
        avgInterruptions: Math.round(avgInterruptions * 10) / 10,
        typeStats,
        categoryStats,
        dailyStats
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
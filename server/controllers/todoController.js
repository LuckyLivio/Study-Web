const Todo = require('../models/Todo');

// 获取所有待办事项
exports.getTodos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      completed, 
      priority, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // 筛选条件
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    if (priority) {
      filter.priority = priority;
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

    const todos = await Todo.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Todo.countDocuments(filter);

    res.json({
      success: true,
      data: {
        todos,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: todos.length,
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取待办事项失败',
      error: error.message
    });
  }
};

// 创建待办事项
exports.createTodo = async (req, res) => {
  try {
    const { title, description, priority, category, dueDate, tags } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '标题不能为空'
      });
    }

    const todo = new Todo({
      title: title.trim(),
      description: description?.trim(),
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || []
    });

    await todo.save();

    res.status(201).json({
      success: true,
      message: '待办事项创建成功',
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建待办事项失败',
      error: error.message
    });
  }
};

// 更新待办事项
exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 不允许直接更新的字段
    delete updates.createdAt;
    delete updates._id;

    const todo = await Todo.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    res.json({
      success: true,
      message: '待办事项更新成功',
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新待办事项失败',
      error: error.message
    });
  }
};

// 切换完成状态
exports.toggleTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.json({
      success: true,
      message: `待办事项已${todo.completed ? '完成' : '取消完成'}`,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '切换状态失败',
      error: error.message
    });
  }
};

// 删除待办事项
exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    res.json({
      success: true,
      message: '待办事项删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除待办事项失败',
      error: error.message
    });
  }
};

// 批量删除已完成的待办事项
exports.deleteCompleted = async (req, res) => {
  try {
    const result = await Todo.deleteMany({ completed: true });

    res.json({
      success: true,
      message: `已删除 ${result.deletedCount} 个已完成的待办事项`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '批量删除失败',
      error: error.message
    });
  }
};

// 获取统计信息
exports.getTodoStats = async (req, res) => {
  try {
    const total = await Todo.countDocuments();
    const completed = await Todo.countDocuments({ completed: true });
    const pending = total - completed;
    
    const priorityStats = await Todo.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    const categoryStats = await Todo.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 今日到期的任务
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueTodayCount = await Todo.countDocuments({
      dueDate: { $gte: today, $lt: tomorrow },
      completed: false
    });

    // 逾期任务
    const overdueCount = await Todo.countDocuments({
      dueDate: { $lt: today },
      completed: false
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        dueToday: dueTodayCount,
        overdue: overdueCount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        priorityStats,
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
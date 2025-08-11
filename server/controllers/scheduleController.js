const { Course, ScheduleSlot, ScheduleTemplate, ScheduleFile, SharedSchedule } = require('../models/Schedule');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 课程控制器
const courseController = {
  // 获取所有课程
  async getAllCourses(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        department = '',
        isActive = true
      } = req.query;

      const query = { isActive };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { teacher: { $regex: search, $options: 'i' } },
          { courseCode: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (department) {
        query.department = department;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Course.countDocuments(query);
      
      const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: {
          courses,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / parseInt(limit)),
            count: total,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('获取课程列表失败:', error);
      res.status(500).json({ success: false, message: '获取课程列表失败' });
    }
  },

  // 获取单个课程详情
  async getCourseById(req, res) {
    try {
      const course = await Course.findOne({ _id: req.params.id, author: req.user._id });
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      res.json({ success: true, data: course });
    } catch (error) {
      console.error('获取课程详情失败:', error);
      res.status(500).json({ success: false, message: '获取课程详情失败' });
    }
  },

  // 创建课程
  async createCourse(req, res) {
    try {
      const courseData = req.body;
      
      // 检查课程是否已存在
      const existingCourse = await Course.findOne({
        name: courseData.name,
        teacher: courseData.teacher,
        author: req.user._id,
        isActive: true
      });
      
      if (existingCourse) {
        return res.status(400).json({ success: false, message: '该课程已存在' });
      }

      const course = new Course({ ...courseData, author: req.user._id });
      await course.save();
      
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      console.error('创建课程失败:', error);
      res.status(500).json({ success: false, message: '创建课程失败' });
    }
  },

  // 更新课程
  async updateCourse(req, res) {
    try {
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      
      res.json({ success: true, data: course });
    } catch (error) {
      console.error('更新课程失败:', error);
      res.status(500).json({ success: false, message: '更新课程失败' });
    }
  },

  // 删除课程
  async deleteCourse(req, res) {
    try {
      // 软删除：设置isActive为false
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id },
        { isActive: false },
        { new: true }
      );
      
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      
      res.json({ success: true, message: '课程删除成功' });
    } catch (error) {
      console.error('删除课程失败:', error);
      res.status(500).json({ success: false, message: '删除课程失败' });
    }
  },

  // 更新课程评价
  async updateCourseRating(req, res) {
    try {
      const { rating, review } = req.body;
      
      const course = await Course.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id },
        { rating, review },
        { new: true, runValidators: true }
      );
      
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      
      res.json({ success: true, data: course });
    } catch (error) {
      console.error('更新课程评价失败:', error);
      res.status(500).json({ success: false, message: '更新课程评价失败' });
    }
  },

  // 获取课程标签
  async getCourseTags(req, res) {
    try {
      const tags = await Course.getPopularTags();
      res.json({ success: true, data: tags });
    } catch (error) {
      console.error('获取课程标签失败:', error);
      res.status(500).json({ success: false, message: '获取课程标签失败' });
    }
  },

  // 获取院系列表
  async getDepartments(req, res) {
    try {
      const departments = await Course.distinct('department', { author: req.user._id, isActive: true });
      res.json({ success: true, data: departments.filter(d => d) });
    } catch (error) {
      console.error('获取院系列表失败:', error);
      res.status(500).json({ success: false, message: '获取院系列表失败' });
    }
  }
};

// 课表控制器
const scheduleController = {
  // 获取课表
  async getSchedule(req, res) {
    try {
      const { semester, week } = req.query;
      
      if (!semester) {
        return res.status(400).json({ success: false, message: '学期参数必填' });
      }

      let query = { 
        semester,
        author: req.user._id // 只查询当前用户的课表
      };
      if (week) {
        query.weeks = { $in: [parseInt(week)] };
      }

      const slots = await ScheduleSlot.find(query)
        .populate('course')
        .sort({ dayOfWeek: 1, startTime: 1 });

      // 按天分组
      const schedule = {};
      slots.forEach(slot => {
        const day = slot.dayOfWeek;
        if (!schedule[day]) {
          schedule[day] = [];
        }
        schedule[day].push(slot);
      });

      res.json({ success: true, data: schedule });
    } catch (error) {
      console.error('获取课表失败:', error);
      res.status(500).json({ success: false, message: '获取课表失败' });
    }
  },

  // 添加课表时间段
  async addScheduleSlot(req, res) {
    try {
      const slotData = {
        ...req.body,
        author: req.user._id // 添加用户标识
      };
      
      // 检查时间冲突
      const conflictSlot = await ScheduleSlot.findOne({
        semester: slotData.semester,
        dayOfWeek: slotData.dayOfWeek,
        weeks: { $in: slotData.weeks },
        author: req.user._id, // 只检查当前用户的时间冲突
        $or: [
          {
            startTime: { $lt: slotData.endTime },
            endTime: { $gt: slotData.startTime }
          }
        ]
      });

      if (conflictSlot) {
        return res.status(400).json({ success: false, message: '时间段冲突' });
      }

      const slot = new ScheduleSlot(slotData);
      await slot.save();
      await slot.populate('course');
      
      res.status(201).json({ success: true, data: slot });
    } catch (error) {
      console.error('添加课表时间段失败:', error);
      res.status(500).json({ success: false, message: '添加课表时间段失败' });
    }
  },

  // 更新课表时间段
  async updateScheduleSlot(req, res) {
    try {
      const slot = await ScheduleSlot.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id }, // 只允许更新自己的课表
        req.body,
        { new: true, runValidators: true }
      ).populate('course');
      
      if (!slot) {
        return res.status(404).json({ success: false, message: '课表时间段不存在' });
      }
      
      res.json({ success: true, data: slot });
    } catch (error) {
      console.error('更新课表时间段失败:', error);
      res.status(500).json({ success: false, message: '更新课表时间段失败' });
    }
  },

  // 删除课表时间段
  async deleteScheduleSlot(req, res) {
    try {
      const slot = await ScheduleSlot.findOneAndDelete({
        _id: req.params.id,
        author: req.user._id // 只允许删除自己的课表
      });
      
      if (!slot) {
        return res.status(404).json({ success: false, message: '课表时间段不存在' });
      }
      
      res.json({ success: true, message: '课表时间段删除成功' });
    } catch (error) {
      console.error('删除课表时间段失败:', error);
      res.status(500).json({ success: false, message: '删除课表时间段失败' });
    }
  },

  // 批量添加课表时间段
  async batchAddScheduleSlots(req, res) {
    try {
      const { slots } = req.body;
      
      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({ success: false, message: '课表数据格式错误' });
      }

      const createdSlots = [];
      const errors = [];

      for (let i = 0; i < slots.length; i++) {
        try {
          const slot = new ScheduleSlot({
            ...slots[i],
            author: req.user._id // 添加用户标识
          });
          await slot.save();
          await slot.populate('course');
          createdSlots.push(slot);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        success: true,
        data: {
          created: createdSlots,
          errors
        }
      });
    } catch (error) {
      console.error('批量添加课表失败:', error);
      res.status(500).json({ success: false, message: '批量添加课表失败' });
    }
  }
};

// 课表模板控制器
const templateController = {
  // 获取课表模板列表
  async getTemplates(req, res) {
    try {
      const templates = await ScheduleTemplate.find().sort({ createdAt: -1 });
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('获取课表模板失败:', error);
      res.status(500).json({ success: false, message: '获取课表模板失败' });
    }
  },

  // 创建课表模板
  async createTemplate(req, res) {
    try {
      const template = new ScheduleTemplate(req.body);
      await template.save();
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      console.error('创建课表模板失败:', error);
      res.status(500).json({ success: false, message: '创建课表模板失败' });
    }
  },

  // 设置默认模板
  async setDefaultTemplate(req, res) {
    try {
      // 先取消所有默认模板
      await ScheduleTemplate.updateMany({}, { isDefault: false });
      
      // 设置新的默认模板
      const template = await ScheduleTemplate.findByIdAndUpdate(
        req.params.id,
        { isDefault: true },
        { new: true }
      );
      
      if (!template) {
        return res.status(404).json({ success: false, message: '模板不存在' });
      }
      
      res.json({ success: true, data: template });
    } catch (error) {
      console.error('设置默认模板失败:', error);
      res.status(500).json({ success: false, message: '设置默认模板失败' });
    }
  }
};

// 文件上传控制器
const fileController = {
  // 上传课表文件
  async uploadScheduleFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请选择文件' });
      }

      const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'excel';
      
      const scheduleFile = new ScheduleFile({
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType,
        filePath: req.file.path,
        fileSize: req.file.size,
        notes: req.body.notes
      });

      await scheduleFile.save();
      
      res.status(201).json({ success: true, data: scheduleFile });
    } catch (error) {
      console.error('上传课表文件失败:', error);
      res.status(500).json({ success: false, message: '上传课表文件失败' });
    }
  },

  // 获取上传文件列表
  async getUploadedFiles(req, res) {
    try {
      const files = await ScheduleFile.find().sort({ uploadDate: -1 });
      res.json({ success: true, data: files });
    } catch (error) {
      console.error('获取文件列表失败:', error);
      res.status(500).json({ success: false, message: '获取文件列表失败' });
    }
  },

  // 删除上传文件
  async deleteUploadedFile(req, res) {
    try {
      const file = await ScheduleFile.findById(req.params.id);
      
      if (!file) {
        return res.status(404).json({ success: false, message: '文件不存在' });
      }

      // 删除物理文件
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }

      // 删除数据库记录
      await ScheduleFile.findByIdAndDelete(req.params.id);
      
      res.json({ success: true, message: '文件删除成功' });
    } catch (error) {
      console.error('删除文件失败:', error);
      res.status(500).json({ success: false, message: '删除文件失败' });
    }
  }
};

// 共享课表控制器
const sharedScheduleController = {
  // 创建共享课表
  async createSharedSchedule(req, res) {
    try {
      const { name, owner, semester, description, courseIds, scheduleSlotIds, isPublic, tags } = req.body;
      
      const shareCode = isPublic ? SharedSchedule.generateShareCode() : undefined;
      
      const sharedSchedule = new SharedSchedule({
        name,
        owner,
        semester,
        description,
        courses: courseIds || [],
        scheduleSlots: scheduleSlotIds || [],
        isPublic,
        shareCode,
        tags: tags || []
      });
      
      await sharedSchedule.save();
      await sharedSchedule.calculateStatistics();
      
      res.status(201).json({
        success: true,
        data: sharedSchedule,
        message: '共享课表创建成功'
      });
    } catch (error) {
      console.error('创建共享课表失败:', error);
      res.status(500).json({
        success: false,
        message: '创建共享课表失败',
        error: error.message
      });
    }
  },

  // 获取所有公开的共享课表
  async getPublicSharedSchedules(req, res) {
    try {
      const { semester, page = 1, limit = 10 } = req.query;
      const query = { isPublic: true };
      
      if (semester) {
        query.semester = semester;
      }
      
      const skip = (page - 1) * limit;
      const sharedSchedules = await SharedSchedule.find(query)
        .populate('courses', 'name teacher credits rating')
        .populate('scheduleSlots', 'dayOfWeek startTime endTime')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await SharedSchedule.countDocuments(query);
      
      res.json({
        success: true,
        data: {
          schedules: sharedSchedules,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(total / limit),
            count: total
          }
        }
      });
    } catch (error) {
      console.error('获取公开共享课表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取公开共享课表失败',
        error: error.message
      });
    }
  },

  // 通过分享码获取课表
  async getSharedScheduleByCode(req, res) {
    try {
      const { shareCode } = req.params;
      
      const sharedSchedule = await SharedSchedule.findByShareCode(shareCode);
      
      if (!sharedSchedule) {
        return res.status(404).json({
          success: false,
          message: '未找到该分享码对应的课表'
        });
      }
      
      res.json({
        success: true,
        data: sharedSchedule
      });
    } catch (error) {
      console.error('获取共享课表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取共享课表失败',
        error: error.message
      });
    }
  },

  // 课表比对分析
  async compareSchedules(req, res) {
    try {
      const { scheduleIds } = req.body;
      
      if (!scheduleIds || scheduleIds.length < 2) {
        return res.status(400).json({
          success: false,
          message: '至少需要选择两个课表进行比对'
        });
      }
      
      const schedules = await SharedSchedule.find({
        _id: { $in: scheduleIds }
      }).populate('courses').populate('scheduleSlots');
      
      if (schedules.length !== scheduleIds.length) {
        return res.status(404).json({
          success: false,
          message: '部分课表未找到'
        });
      }
      
      // 分析共同课程
      const allCourses = schedules.map(s => s.courses.map(c => c.name));
      const commonCourses = allCourses.reduce((common, courses) => 
        common.filter(course => courses.includes(course))
      );
      
      // 分析时间冲突
      const timeConflicts = [];
      const allSlots = schedules.flatMap((schedule, index) => 
        schedule.scheduleSlots.map(slot => ({ ...slot.toObject(), scheduleIndex: index }))
      );
      
      for (let i = 0; i < allSlots.length; i++) {
        for (let j = i + 1; j < allSlots.length; j++) {
          const slot1 = allSlots[i];
          const slot2 = allSlots[j];
          
          if (slot1.scheduleIndex !== slot2.scheduleIndex &&
              slot1.dayOfWeek === slot2.dayOfWeek &&
              isTimeOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
            timeConflicts.push({
              day: slot1.dayOfWeek,
              time1: `${slot1.startTime}-${slot1.endTime}`,
              time2: `${slot2.startTime}-${slot2.endTime}`,
              schedule1: schedules[slot1.scheduleIndex].name,
              schedule2: schedules[slot2.scheduleIndex].name
            });
          }
        }
      }
      
      // 分析共同空闲时间
      const freeTimeSlots = findCommonFreeTime(schedules);
      
      // 统计信息
      const statistics = {
        totalSchedules: schedules.length,
        commonCourses: commonCourses.length,
        timeConflicts: timeConflicts.length,
        commonFreeSlots: freeTimeSlots.length,
        scheduleStats: schedules.map(s => ({
          name: s.name,
          owner: s.owner,
          ...s.statistics
        }))
      };
      
      res.json({
        success: true,
        data: {
          schedules: schedules.map(s => ({
            _id: s._id,
            name: s.name,
            owner: s.owner,
            statistics: s.statistics
          })),
          analysis: {
            commonCourses,
            timeConflicts,
            commonFreeTime: freeTimeSlots,
            statistics
          }
        }
      });
    } catch (error) {
      console.error('课表比对分析失败:', error);
      res.status(500).json({
        success: false,
        message: '课表比对分析失败',
        error: error.message
      });
    }
  }
};

// 辅助函数：检查时间重叠
function isTimeOverlap(start1, end1, start2, end2) {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
}

// 辅助函数：找到共同空闲时间
function findCommonFreeTime(schedules) {
  const workDays = [1, 2, 3, 4, 5]; // 周一到周五
  const workHours = { start: 8, end: 22 }; // 8:00-22:00
  const freeSlots = [];
  
  for (const day of workDays) {
    const daySlots = schedules.flatMap(schedule => 
      schedule.scheduleSlots
        .filter(slot => slot.dayOfWeek === day)
        .map(slot => ({
          start: timeToMinutes(slot.startTime),
          end: timeToMinutes(slot.endTime)
        }))
    );
    
    // 合并重叠的时间段
    const mergedSlots = mergeTimeSlots(daySlots);
    
    // 找到空闲时间
    let currentTime = workHours.start * 60;
    const endTime = workHours.end * 60;
    
    for (const slot of mergedSlots.sort((a, b) => a.start - b.start)) {
      if (currentTime < slot.start) {
        freeSlots.push({
          day,
          startTime: minutesToTime(currentTime),
          endTime: minutesToTime(slot.start),
          duration: slot.start - currentTime
        });
      }
      currentTime = Math.max(currentTime, slot.end);
    }
    
    if (currentTime < endTime) {
      freeSlots.push({
        day,
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(endTime),
        duration: endTime - currentTime
      });
    }
  }
  
  return freeSlots.filter(slot => slot.duration >= 60); // 至少1小时的空闲时间
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function mergeTimeSlots(slots) {
  if (slots.length === 0) return [];
  
  const sorted = slots.sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

module.exports = {
  courseController,
  scheduleController,
  templateController,
  fileController,
  sharedScheduleController
};
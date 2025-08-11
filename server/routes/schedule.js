const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  courseController,
  scheduleController,
  templateController,
  fileController,
  sharedScheduleController
} = require('../controllers/scheduleController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/schedules');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // 允许图片和Excel文件
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 公开路由（不需要认证）
router.get('/shared-schedules/public', sharedScheduleController.getPublicSharedSchedules);
router.get('/shared-schedules/code/:shareCode', sharedScheduleController.getSharedScheduleByCode);

// 以下路由需要认证
router.use(authenticate);

// 课程管理路由
router.get('/courses', courseController.getAllCourses);
router.get('/courses/tags', courseController.getCourseTags);
router.get('/courses/departments', courseController.getDepartments);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.put('/courses/:id/rating', courseController.updateCourseRating);

// 课表管理路由
router.get('/schedule', scheduleController.getSchedule);
router.post('/schedule/slots', scheduleController.addScheduleSlot);
router.put('/schedule/slots/:id', scheduleController.updateScheduleSlot);
router.delete('/schedule/slots/:id', scheduleController.deleteScheduleSlot);
router.post('/schedule/slots/batch', scheduleController.batchAddScheduleSlots);

// 课表模板路由
router.get('/templates', templateController.getTemplates);
router.post('/templates', templateController.createTemplate);
router.put('/templates/:id/default', templateController.setDefaultTemplate);

// 文件上传路由
router.post('/upload', upload.single('scheduleFile'), fileController.uploadScheduleFile);
router.get('/files', fileController.getUploadedFiles);
router.delete('/files/:id', fileController.deleteUploadedFile);

// 共享课表相关路由（需要认证）
router.post('/shared-schedules', sharedScheduleController.createSharedSchedule);
router.post('/shared-schedules/compare', sharedScheduleController.compareSchedules);

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: '文件大小超过限制（最大10MB）' });
    }
  }
  if (error.message === '不支持的文件类型') {
    return res.status(400).json({ success: false, message: '不支持的文件类型，请上传图片或Excel文件' });
  }
  res.status(500).json({ success: false, message: '服务器错误' });
});

module.exports = router;

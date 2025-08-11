const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { studyNoteController, studyMaterialController, studyPlanController } = require('../controllers/studyController');
const { authenticate } = require('../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/study');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype.includes('document') || 
                    file.mimetype.includes('spreadsheet') || 
                    file.mimetype.includes('presentation');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传文档类型文件'));
    }
  }
});

// ==================== 学习笔记相关路由 ====================

// 所有学习相关路由都需要认证
router.use(authenticate);

// 获取所有学习笔记
router.get('/notes', studyNoteController.getAllNotes);

// 获取单个学习笔记详情
router.get('/notes/:id', studyNoteController.getNoteById);

// 创建学习笔记
router.post('/notes', upload.array('attachments', 5), studyNoteController.createNote);

// 更新学习笔记
router.put('/notes/:id', upload.array('attachments', 5), studyNoteController.updateNote);

// 删除学习笔记
router.delete('/notes/:id', studyNoteController.deleteNote);

// ==================== 学习资料相关路由 ====================

// 获取所有学习资料
router.get('/materials', studyMaterialController.getAllMaterials);

// 上传学习资料
router.post('/materials', upload.single('file'), studyMaterialController.uploadMaterial);

// 下载学习资料
router.get('/materials/:id/download', studyMaterialController.downloadMaterial);

// 删除学习资料
router.delete('/materials/:id', studyMaterialController.deleteMaterial);

// ==================== 学习计划相关路由 ====================

// 获取所有学习计划
router.get('/plans', studyPlanController.getAllPlans);

// 创建学习计划
router.post('/plans', studyPlanController.createPlan);

// 更新学习计划
router.put('/plans/:id', studyPlanController.updatePlan);

// 更新任务状态
router.put('/plans/:id/tasks', studyPlanController.updateTaskStatus);

// 删除学习计划
router.delete('/plans/:id', studyPlanController.deletePlan);

// 获取即将到期的提醒
router.get('/reminders/upcoming', studyPlanController.getUpcomingReminders);

module.exports = router;
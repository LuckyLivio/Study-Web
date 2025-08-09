const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/portfolio');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // 最多10个文件
  }
});

// 错误处理中间件
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小不能超过10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: '最多只能上传10个文件'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '意外的文件字段'
      });
    }
  }
  
  if (error.message === '只允许上传图片文件') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// 清理文件函数
const cleanupFiles = (files) => {
  if (!files) return;
  
  const filesToClean = Array.isArray(files) ? files : [files];
  filesToClean.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('清理文件失败:', err);
      }
    }
  });
};

// 删除文件函数
const deleteFile = (filename) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      console.error('删除文件失败:', err);
      return false;
    }
  }
  return false;
};

// 获取文件URL
const getFileUrl = (filename) => {
  return `/uploads/portfolio/${filename}`;
};

module.exports = {
  upload,
  handleUploadError,
  cleanupFiles,
  deleteFile,
  getFileUrl,
  uploadDir
};
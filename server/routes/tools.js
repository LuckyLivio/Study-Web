const express = require('express');
const router = express.Router();
const toolsController = require('../controllers/toolsController');

// 表情包相关
router.get('/emojis', toolsController.getEmojis);
router.get('/emojis/random', toolsController.getRandomEmoji);

// 学习贴士相关
router.get('/study-tips', toolsController.getStudyTips);
router.get('/study-tips/random', toolsController.getRandomStudyTip);

// 励志名言
router.get('/quote', toolsController.getMotivationalQuote);

// 随机颜色生成器
router.get('/color/random', toolsController.getRandomColor);

// 时间信息
router.get('/time', toolsController.getTimeInfo);

module.exports = router;

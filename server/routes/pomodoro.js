const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');

// 获取番茄钟会话记录
router.get('/sessions', pomodoroController.getSessions);

// 开始新的番茄钟会话
router.post('/sessions', pomodoroController.startSession);

// 完成番茄钟会话
router.patch('/sessions/:id/complete', pomodoroController.completeSession);

// 取消番茄钟会话
router.patch('/sessions/:id/cancel', pomodoroController.cancelSession);

// 更新会话信息
router.put('/sessions/:id', pomodoroController.updateSession);

// 删除会话
router.delete('/sessions/:id', pomodoroController.deleteSession);

// 获取统计信息
router.get('/stats', pomodoroController.getPomodoroStats);

module.exports = router;
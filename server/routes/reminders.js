const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// 获取所有提醒事项
router.get('/', reminderController.getReminders);

// 获取即将到来的提醒
router.get('/upcoming', reminderController.getUpcomingReminders);

// 创建提醒事项
router.post('/', reminderController.createReminder);

// 更新提醒事项
router.put('/:id', reminderController.updateReminder);

// 完成提醒
router.patch('/:id/complete', reminderController.completeReminder);

// 延迟提醒
router.patch('/:id/snooze', reminderController.snoozeReminder);

// 删除提醒事项
router.delete('/:id', reminderController.deleteReminder);

// 获取统计信息
router.get('/stats', reminderController.getReminderStats);

module.exports = router;
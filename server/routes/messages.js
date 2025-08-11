const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// 公开接口
router.get('/public', messageController.getPublicMessages);
router.post('/', messageController.createMessage);
router.post('/:id/like', messageController.likeMessage);

// 管理员接口 - 需要认证
router.use(authenticate);
router.get('/admin', messageController.getAllMessages);
router.post('/:id/reply', messageController.replyMessage);
router.put('/:id/status', messageController.updateMessageStatus);
router.delete('/:id', messageController.deleteMessage);
router.get('/stats', messageController.getMessageStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

// 公开接口
router.get('/public', linkController.getPublicLinks);
router.post('/:id/click', linkController.recordClick);
router.get('/metadata', linkController.getMetadata);

// 管理员接口
router.get('/', linkController.getAllLinks);
router.post('/', linkController.createLink);
router.put('/:id', linkController.updateLink);
router.delete('/:id', linkController.deleteLink);
router.put('/order/batch', linkController.updateOrder);
router.get('/stats', linkController.getLinkStats);

module.exports = router;
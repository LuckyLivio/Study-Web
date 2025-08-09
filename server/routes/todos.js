const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

// 获取所有待办事项
router.get('/', todoController.getTodos);

// 创建待办事项
router.post('/', todoController.createTodo);

// 更新待办事项
router.put('/:id', todoController.updateTodo);

// 切换完成状态
router.patch('/:id/toggle', todoController.toggleTodo);

// 删除待办事项
router.delete('/:id', todoController.deleteTodo);

// 批量删除已完成的待办事项
router.delete('/completed/batch', todoController.deleteCompleted);

// 获取统计信息
router.get('/stats', todoController.getTodoStats);

module.exports = router;
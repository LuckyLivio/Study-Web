import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import todoService, { Todo, TodoQueryParams } from '../../services/todoService';

interface TodoListProps {
  className?: string;
}

const TodoList: React.FC<TodoListProps> = ({ className = '' }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priority, setPriority] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0
  });

  const [newTodoForm, setNewTodoForm] = useState({
    title: '',
    description: '',
    priority: '中' as '低' | '中' | '高',
    category: '其他' as '工作' | '学习' | '生活' | '其他',
    dueDate: '',
    tags: [] as string[]
  });

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params: TodoQueryParams = {
        page: pagination.current,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filter === 'pending') params.completed = false;
      if (filter === 'completed') params.completed = true;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      const response = await todoService.getTodos(params);
      setTodos(response.data.todos);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('获取待办事项失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [filter, priority, category, pagination.current]);

  const handleAddTodo = async () => {
    if (!newTodoForm.title.trim()) return;

    try {
      await todoService.createTodo({
        ...newTodoForm,
        dueDate: newTodoForm.dueDate || undefined
      });
      setNewTodoForm({
        title: '',
        description: '',
        priority: '中',
        category: '其他',
        dueDate: '',
        tags: []
      });
      setShowAddForm(false);
      fetchTodos();
    } catch (error) {
      console.error('创建待办事项失败:', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('切换状态失败:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('确定要删除这个待办事项吗？')) return;

    try {
      await todoService.deleteTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('删除待办事项失败:', error);
    }
  };

  const handleDeleteCompleted = async () => {
    if (!window.confirm('确定要删除所有已完成的待办事项吗？')) return;

    try {
      await todoService.deleteCompleted();
      fetchTodos();
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'text-red-600 bg-red-50';
      case '中': return 'text-yellow-600 bg-yellow-50';
      case '低': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '工作': return 'text-blue-600 bg-blue-50';
      case '学习': return 'text-purple-600 bg-purple-50';
      case '生活': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">待办清单</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            添加
          </button>
          <button
            onClick={handleDeleteCompleted}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            清理已完成
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">筛选:</span>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">全部</option>
          <option value="pending">未完成</option>
          <option value="completed">已完成</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="">所有优先级</option>
          <option value="高">高优先级</option>
          <option value="中">中优先级</option>
          <option value="低">低优先级</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="">所有分类</option>
          <option value="工作">工作</option>
          <option value="学习">学习</option>
          <option value="生活">生活</option>
          <option value="其他">其他</option>
        </select>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="任务标题"
              value={newTodoForm.title}
              onChange={(e) => setNewTodoForm({ ...newTodoForm, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="任务描述"
              value={newTodoForm.description}
              onChange={(e) => setNewTodoForm({ ...newTodoForm, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newTodoForm.priority}
              onChange={(e) => setNewTodoForm({ ...newTodoForm, priority: e.target.value as '低' | '中' | '高' })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="低">低优先级</option>
              <option value="中">中优先级</option>
              <option value="高">高优先级</option>
            </select>
            <select
              value={newTodoForm.category}
              onChange={(e) => setNewTodoForm({ ...newTodoForm, category: e.target.value as '工作' | '学习' | '生活' | '其他' })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="工作">工作</option>
              <option value="学习">学习</option>
              <option value="生活">生活</option>
              <option value="其他">其他</option>
            </select>
            <input
              type="datetime-local"
              value={newTodoForm.dueDate}
              onChange={(e) => setNewTodoForm({ ...newTodoForm, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddTodo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              添加任务
            </button>
          </div>
        </div>
      )}

      {/* 待办事项列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无待办事项</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className={`p-4 border rounded-lg transition-all ${
                todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => handleToggleTodo(todo._id)}
                    className={`mt-1 p-1 rounded-full transition-colors ${
                      todo.completed
                        ? 'bg-green-600 text-white'
                        : 'border-2 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {todo.completed && <CheckIcon className="h-3 w-3" />}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={`text-sm mt-1 ${
                        todo.completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {todo.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}优先级
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(todo.category)}`}>
                        {todo.category}
                      </span>
                      {todo.dueDate && (
                        <span className="text-xs text-gray-500">
                          截止: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteTodo(todo._id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      {pagination.total > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.total }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination({ ...pagination, current: page })}
                className={`px-3 py-2 rounded-md transition-colors ${
                  page === pagination.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
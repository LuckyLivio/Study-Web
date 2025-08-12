import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, BellIcon, ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import reminderService, { Reminder, ReminderQueryParams } from '../../services/reminderService';

interface RemindersCenterProps {
  className?: string;
}

const RemindersCenter: React.FC<RemindersCenterProps> = ({ className = '' }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0
  });

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminderTime: '',
    type: '一次性' as '一次性' | '每日' | '每周' | '每月',
    priority: '中' as '低' | '中' | '高',
    category: '工作' as '工作' | '学习' | '生活' | '健康' | '其他'
  });

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const params: ReminderQueryParams = {
        page: pagination.current,
        limit: 10,
        sortBy: 'reminderTime',
        sortOrder: 'asc'
      };

      if (filter === 'active') params.isActive = true;
      if (filter === 'completed') params.isCompleted = true;
      if (typeFilter) params.type = typeFilter;
      // priority 不在 ReminderQueryParams 中，移除此行

      const response = await reminderService.getReminders(params);
      setReminders(response.data.reminders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('获取提醒事项失败:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter, priorityFilter, pagination.current]);

  const fetchUpcomingReminders = useCallback(async () => {
    try {
      const response = await reminderService.getUpcomingReminders();
      setUpcomingReminders(response.data);
    } catch (error) {
      console.error('获取即将到来的提醒失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    fetchUpcomingReminders();
  }, [fetchReminders, fetchUpcomingReminders]);

  const handleAddReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.reminderTime) return;

    try {
      await reminderService.createReminder(newReminder);
      setNewReminder({
        title: '',
        description: '',
        reminderTime: '',
        type: '一次性',
        priority: '中',
        category: '工作'
      });
      setShowAddForm(false);
      fetchReminders();
      fetchUpcomingReminders();
    } catch (error) {
      console.error('创建提醒失败:', error);
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await reminderService.completeReminder(id);
      fetchReminders();
      fetchUpcomingReminders();
    } catch (error) {
      console.error('完成提醒失败:', error);
    }
  };

  const handleSnoozeReminder = async (id: string, minutes: number) => {
    try {
      await reminderService.snoozeReminder(id, minutes);
      fetchReminders();
      fetchUpcomingReminders();
    } catch (error) {
      console.error('延迟提醒失败:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!window.confirm('确定要删除这个提醒吗？')) return;

    try {
      await reminderService.deleteReminder(id);
      fetchReminders();
      fetchUpcomingReminders();
    } catch (error) {
      console.error('删除提醒失败:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'text-red-600 bg-red-50 border-red-200';
      case '中': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case '低': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '每日': return '📅';
      case '每周': return '📆';
      case '每月': return '🗓️';
      case '一次性': return '📋';
      default: return '📌';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return '已过期';
    } else if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}分钟后`;
    } else if (diffHours < 24) {
      return `${diffHours}小时后`;
    } else if (diffDays < 7) {
      return `${diffDays}天后`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">提醒事项中心</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          添加提醒
        </button>
      </div>

      {/* 即将到来的提醒 */}
      {upcomingReminders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <BellIcon className="h-5 w-5 mr-2 text-orange-500" />
            即将到来的提醒
          </h3>
          <div className="space-y-2">
            {upcomingReminders.slice(0, 3).map((reminder) => (
              <div
                key={reminder._id}
                className={`p-3 rounded-lg border-l-4 ${
                  isOverdue(reminder.reminderTime)
                    ? 'bg-red-50 border-red-400'
                    : 'bg-orange-50 border-orange-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(reminder.type)}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{reminder.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(reminder.reminderTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSnoozeReminder(reminder._id, 15)}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                    >
                      延迟15分钟
                    </button>
                    <button
                      onClick={() => handleCompleteReminder(reminder._id)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      完成
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">筛选:</span>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">全部</option>
          <option value="active">活跃</option>
          <option value="completed">已完成</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="">所有类型</option>
          <option value="一次性">一次性</option>
          <option value="每日">每日</option>
          <option value="每周">每周</option>
          <option value="每月">每月</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="">所有优先级</option>
          <option value="高">高优先级</option>
          <option value="中">中优先级</option>
          <option value="低">低优先级</option>
        </select>
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="提醒标题"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="提醒描述"
              value={newReminder.description}
              onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="datetime-local"
              value={newReminder.reminderTime}
              onChange={(e) => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={newReminder.type}
              onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as '一次性' | '每日' | '每周' | '每月' })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="一次性">一次性</option>
              <option value="每日">每日</option>
              <option value="每周">每周</option>
              <option value="每月">每月</option>
            </select>
            <select
              value={newReminder.priority}
              onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as '低' | '中' | '高' })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="低">低优先级</option>
              <option value="中">中优先级</option>
              <option value="高">高优先级</option>
            </select>
            <select
              value={newReminder.category}
              onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value as '工作' | '学习' | '生活' | '健康' | '其他' })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="工作">工作</option>
              <option value="学习">学习</option>
              <option value="生活">生活</option>
              <option value="健康">健康</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddReminder}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              添加提醒
            </button>
          </div>
        </div>
      )}

      {/* 提醒列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无提醒事项</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder._id}
              className={`p-4 border rounded-lg transition-all ${
                reminder.isCompleted
                  ? 'bg-gray-50 border-gray-200'
                  : isOverdue(reminder.reminderTime)
                  ? 'bg-red-50 border-red-300'
                  : 'bg-white border-gray-300 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-xl mt-1">{getTypeIcon(reminder.type)}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium ${
                        reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}>
                        {reminder.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                    </div>
                    
                    {reminder.description && (
                      <p className={`text-sm mb-2 ${
                        reminder.isCompleted ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {reminder.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span className={isOverdue(reminder.reminderTime) ? 'text-red-600 font-medium' : ''}>
                          {formatDateTime(reminder.reminderTime)}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {reminder.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!reminder.isCompleted && (
                    <>
                      <button
                        onClick={() => handleSnoozeReminder(reminder._id, 30)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                        title="延迟30分钟"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCompleteReminder(reminder._id)}
                        className="p-2 text-green-600 hover:text-green-800 transition-colors"
                        title="标记为完成"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteReminder(reminder._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="删除提醒"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
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

export default RemindersCenter;
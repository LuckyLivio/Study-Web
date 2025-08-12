import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { studyPlansApi, StudyPlan } from '../../services/studyService';
import StudyPlanModal from './StudyPlanModal';

interface StudyPlansProps {
  searchTerm: string;
}

const StudyPlans: React.FC<StudyPlansProps> = ({ searchTerm }) => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
  });

  const statuses = ['未开始', '进行中', '已完成', '已暂停', '已取消'];
  const priorities = ['低', '中', '高', '紧急'];
  const types = ['学习计划', '复习计划', '项目计划', '考试准备', '其他'];

  const fetchPlans = async () => {
    try {
      setLoading(true);
      
      // 检查是否有token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('用户未登录，无法获取学习计划');
        setPlans([]);
        return;
      }
      
      const response = await studyPlansApi.getPlans({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...filters,
      });
      setPlans(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error: any) {
      console.error('获取学习计划失败:', error);
      
      // 如果是认证错误，清空数据
      if (error?.data?.error === 'NETWORK_ERROR' || error?.response?.status === 401) {
        console.log('认证失败，用户可能需要重新登录');
        setPlans([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentPage, searchTerm, filters]);

  const handleCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个学习计划吗？')) {
      try {
        await studyPlansApi.deletePlan(id);
        fetchPlans();
      } catch (error) {
        console.error('删除学习计划失败:', error);
      }
    }
  };

  const handleStatusChange = async (planId: string, newStatus: '未开始' | '进行中' | '已完成' | '已取消' | '已延期') => {
    try {
      await studyPlansApi.updatePlan(planId, { status: newStatus });
      fetchPlans();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleTaskToggle = async (planId: string, taskIndex: number) => {
    try {
      await studyPlansApi.updateTaskStatus(planId, { taskIndex });
      fetchPlans();
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    fetchPlans();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '未开始':
        return 'bg-gray-100 text-gray-800';
      case '进行中':
        return 'bg-blue-100 text-blue-800';
      case '已完成':
        return 'bg-green-100 text-green-800';
      case '已暂停':
        return 'bg-yellow-100 text-yellow-800';
      case '已取消':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '低':
        return 'bg-green-100 text-green-800';
      case '中':
        return 'bg-yellow-100 text-yellow-800';
      case '高':
        return 'bg-orange-100 text-orange-800';
      case '紧急':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isOverdue = (endDate: string, status: string) => {
    if (status === '已完成' || status === '已取消') return false;
    return new Date(endDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateCompletedTasks = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return { completed: 0, total: 0 };
    const completed = tasks.filter(task => task.isCompleted).length;
    return { completed, total: tasks.length };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有状态</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有优先级</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有类型</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>新建计划</span>
        </button>
      </div>

      {/* 计划列表 */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无学习计划</h3>
          <p className="mt-1 text-sm text-gray-500">创建你的第一个学习计划吧！</p>
          <div className="mt-6">
            <button onClick={handleCreate} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              新建计划
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const taskStats = calculateCompletedTasks(plan.tasks);
            const overdue = isOverdue(plan.endDate, plan.status);
            
            return (
              <div
                key={plan._id}
                className={`card hover:shadow-md transition-shadow duration-200 ${
                  overdue ? 'border-l-4 border-red-500' : ''
                }`}
              >
                {/* 头部信息 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.title}
                      </h3>
                      {overdue && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="已逾期" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(plan.priority)}`}>
                        {plan.priority}优先级
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {plan.type}
                      </span>
                      {plan.subject && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                          {plan.subject}
                        </span>
                      )}
                    </div>
                    
                    {plan.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="编辑"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id!)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">进度</span>
                    <span className="text-sm text-gray-500">{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(plan.progress)}`}
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 时间信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">开始日期</p>
                      <p className="font-medium">{formatDate(plan.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FlagIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">结束日期</p>
                      <p className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
                        {formatDate(plan.endDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">预计时长</p>
                      <p className="font-medium">{plan.estimatedHours}小时</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">任务进度</p>
                      <p className="font-medium">
                        {taskStats.completed}/{taskStats.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 任务列表 */}
                {plan.tasks && plan.tasks.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">任务清单</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {plan.tasks.slice(0, 5).map((task, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <button
                            onClick={() => handleTaskToggle(plan._id!, index)}
                            className={`flex-shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                              task.isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {task.isCompleted && (
                              <CheckCircleIcon className="h-3 w-3" />
                            )}
                          </button>
                          <span
                            className={`text-sm flex-1 ${
                              task.isCompleted
                                ? 'line-through text-gray-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {plan.tasks.length > 5 && (
                        <p className="text-xs text-gray-500 pl-7">
                          还有 {plan.tasks.length - 5} 个任务...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 快速操作 */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                  <div className="flex items-center space-x-2">
                    {plan.status === '未开始' && (
                      <button
                        onClick={() => handleStatusChange(plan._id!, '进行中')}
                        className="btn-secondary text-xs py-1 px-3 flex items-center space-x-1"
                      >
                        <PlayIcon className="h-3 w-3" />
                        <span>开始</span>
                      </button>
                    )}
                    {plan.status === '进行中' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(plan._id!, '已取消')}
                          className="btn-secondary text-xs py-1 px-3 flex items-center space-x-1"
                        >
                          <PauseIcon className="h-3 w-3" />
                          <span>取消</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(plan._id!, '已完成')}
                          className="btn-primary text-xs py-1 px-3 flex items-center space-x-1"
                        >
                          <CheckCircleIcon className="h-3 w-3" />
                          <span>完成</span>
                        </button>
                      </>
                    )}
                    {plan.status === '进行中' && (
                      <button
                        onClick={() => handleStatusChange(plan._id!, '已完成')}
                        className="btn-primary text-xs py-1 px-3 flex items-center space-x-1"
                      >
                        <CheckCircleIcon className="h-3 w-3" />
                        <span>完成</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    创建于 {formatDate(plan.createdAt!)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <span className="px-3 py-2 text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 计划模态框 */}
      <StudyPlanModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        plan={editingPlan}
      />
    </div>
  );
};

export default StudyPlans;
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useForm, useFieldArray } from 'react-hook-form';
import { studyPlansApi, StudyPlan } from '../../services/studyService';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: StudyPlan | null;
}

interface FormData {
  title: string;
  description: string;
  subject: string;
  type: '学习计划' | '复习计划' | '考试准备' | '其他' | '作业提醒';
  priority: '低' | '中' | '高' | '紧急';
  startDate: string;
  endDate: string;
  estimatedHours: number;
  tasks: { title: string; completed: boolean }[];
  reminders: { date: string; message: string }[];
  tags: string;
  notes: string;
}

const StudyPlanModal: React.FC<StudyPlanModalProps> = ({ isOpen, onClose, plan }) => {
  const [saving, setSaving] = useState(false);
  const isEditing = !!plan;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      priority: '中',
      type: '学习计划',
      tasks: [{ title: '', completed: false }],
      reminders: [],
    },
  });

  const {
    fields: taskFields,
    append: appendTask,
    remove: removeTask,
  } = useFieldArray({
    control,
    name: 'tasks',
  });

  const {
    fields: reminderFields,
    append: appendReminder,
    remove: removeReminder,
  } = useFieldArray({
    control,
    name: 'reminders',
  });

  const priorities = ['低', '中', '高', '紧急'];
  const types = ['学习计划', '复习计划', '项目计划', '考试准备', '其他'];
  const subjects = ['数学', '英语', '计算机', '物理', '化学', '其他'];

  // 监听开始和结束日期，确保结束日期不早于开始日期
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (plan) {
      const formData: FormData = {
        title: plan.title,
        description: plan.description || '',
        subject: plan.subject || '',
        type: plan.type,
        priority: plan.priority,
        startDate: plan.startDate.split('T')[0],
        endDate: plan.endDate.split('T')[0],
        estimatedHours: plan.estimatedHours,
        tasks: plan.tasks && plan.tasks.length > 0 ? plan.tasks.map(task => ({ title: task.title, completed: task.isCompleted })) : [{ title: '', completed: false }],
        reminders: plan.reminders || [],
        tags: plan.tags ? plan.tags.join(', ') : '',
        notes: plan.notes || '',
      };
      reset(formData);
    } else {
      reset({
        priority: '中',
        type: '学习计划',
        tasks: [{ title: '', completed: false }],
        reminders: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    }
  }, [plan, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      
      // 处理标签
      const tags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 过滤空任务
      const tasks = data.tasks.filter(task => task.title.trim().length > 0);

      // 过滤空提醒
      const reminders = data.reminders.filter(reminder => 
        reminder.date && reminder.message.trim().length > 0
      );

      const planData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        type: data.type,
        priority: data.priority,
        status: isEditing ? plan?.status || '未开始' : '未开始',
        progress: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        estimatedHours: data.estimatedHours,
        tasks: tasks.map(task => ({
          title: task.title,
          isCompleted: task.completed || false,
          estimatedMinutes: 30
        })),
        tags,
        reminders: reminders.map(reminder => ({
          date: reminder.date,
          message: reminder.message,
          isActive: true,
          isSent: false
        })),
        notes: data.notes,
      };

      if (isEditing) {
        await studyPlansApi.updatePlan(plan._id!, planData);
      } else {
        await studyPlansApi.createPlan(planData);
      }
      
      onClose();
    } catch (error) {
      console.error('保存学习计划失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const addTask = () => {
    appendTask({ title: '', completed: false });
  };

  const addReminder = () => {
    appendReminder({ date: '', message: '' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '低':
        return 'border-green-300 bg-green-50';
      case '中':
        return 'border-yellow-300 bg-yellow-50';
      case '高':
        return 'border-orange-300 bg-orange-50';
      case '紧急':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {isEditing ? '编辑学习计划' : '新建学习计划'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  计划标题 *
                </label>
                <input
                  type="text"
                  {...register('title', { required: '请输入计划标题' })}
                  className="input-field"
                  placeholder="输入学习计划标题"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  计划类型 *
                </label>
                <select
                  {...register('type', { required: '请选择计划类型' })}
                  className="input-field"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  优先级 *
                </label>
                <select
                  {...register('priority', { required: '请选择优先级' })}
                  className={`input-field ${getPriorityColor(watch('priority'))}`}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  相关科目
                </label>
                <select {...register('subject')} className="input-field">
                  <option value="">选择科目</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预计时长（小时） *
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  {...register('estimatedHours', { 
                    required: '请输入预计时长',
                    min: { value: 0.5, message: '时长至少为0.5小时' }
                  })}
                  className="input-field"
                  placeholder="例如：10"
                />
                {errors.estimatedHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedHours.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期 *
                </label>
                <input
                  type="date"
                  {...register('startDate', { required: '请选择开始日期' })}
                  className="input-field"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期 *
                </label>
                <input
                  type="date"
                  min={startDate}
                  {...register('endDate', { 
                    required: '请选择结束日期',
                    validate: (value) => {
                      if (startDate && value < startDate) {
                        return '结束日期不能早于开始日期';
                      }
                      return true;
                    }
                  })}
                  className="input-field"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* 计划描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                计划描述
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input-field"
                placeholder="详细描述这个学习计划的目标和内容"
              />
            </div>

            {/* 任务清单 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  任务清单
                </label>
                <button
                  type="button"
                  onClick={addTask}
                  className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>添加任务</span>
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {taskFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <input
                      type="text"
                      {...register(`tasks.${index}.title`)}
                      className="input-field flex-1"
                      placeholder={`任务 ${index + 1}`}
                    />
                    {taskFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 提醒设置 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  提醒设置
                </label>
                <button
                  type="button"
                  onClick={addReminder}
                  className="btn-secondary text-sm py-1 px-3 flex items-center space-x-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>添加提醒</span>
                </button>
              </div>
              
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reminderFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-3">
                    <input
                      type="datetime-local"
                      {...register(`reminders.${index}.date`)}
                      className="input-field w-48"
                    />
                    <input
                      type="text"
                      {...register(`reminders.${index}.message`)}
                      className="input-field flex-1"
                      placeholder="提醒内容"
                    />
                    <button
                      type="button"
                      onClick={() => removeReminder(index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {reminderFields.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    暂无提醒设置，点击上方按钮添加提醒
                  </p>
                )}
              </div>
            </div>

            {/* 标签和备注 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="input-field"
                  placeholder="用逗号分隔多个标签"
                />
                <p className="mt-1 text-xs text-gray-500">
                  例如：期末复习,重要,数学
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="input-field"
                  placeholder="其他备注信息"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>保存中...</span>
                  </div>
                ) : (
                  isEditing ? '更新计划' : '创建计划'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default StudyPlanModal;
import api from './api';

// 接口类型定义
export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  reminderTime: string;
  type: '一次性' | '每日' | '每周' | '每月';
  priority: '低' | '中' | '高';
  category: '工作' | '学习' | '生活' | '健康' | '其他';
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  snoozeUntil?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReminderStats {
  total: number;
  completed: number;
  pending: number;
  today: number;
  overdue: number;
  completionRate: number;
  typeStats: Array<{ _id: string; count: number }>;
  categoryStats: Array<{ _id: string; count: number }>;
}

export interface ReminderQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  type?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  reminders: T[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

class ReminderService {
  private apiClient = {
    get: (url: string, config?: any) => api.get(`/reminders${url}`, config),
    post: (url: string, data?: any, config?: any) => api.post(`/reminders${url}`, data, config),
    put: (url: string, data?: any, config?: any) => api.put(`/reminders${url}`, data, config),
    delete: (url: string, config?: any) => api.delete(`/reminders${url}`, config),
  };

  // 获取提醒事项列表
  async getReminders(params?: ReminderQueryParams): Promise<ApiResponse<PaginatedResponse<Reminder>>> {
    try {
      const response = await this.apiClient.get('/', { params });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取提醒事项失败');
    }
  }

  // 获取即将到来的提醒
  async getUpcomingReminders(hours: number = 24): Promise<ApiResponse<Reminder[]>> {
    try {
      const response = await this.apiClient.get('/upcoming', { params: { hours } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取即将到来的提醒失败');
    }
  }

  // 创建提醒事项
  async createReminder(reminderData: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    try {
      const response = await this.apiClient.post('/', reminderData);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '创建提醒事项失败');
    }
  }

  // 更新提醒事项
  async updateReminder(id: string, reminderData: Partial<Reminder>): Promise<ApiResponse<Reminder>> {
    try {
      const response = await this.apiClient.put(`/${id}`, reminderData);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '更新提醒事项失败');
    }
  }

  // 完成提醒
  async completeReminder(id: string): Promise<ApiResponse<Reminder>> {
    try {
      const response = await this.apiClient.put(`/${id}/complete`);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '完成提醒失败');
    }
  }

  // 延迟提醒
  async snoozeReminder(id: string, minutes: number = 10): Promise<ApiResponse<Reminder>> {
    try {
      const response = await this.apiClient.put(`/${id}/snooze`, { minutes });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '延迟提醒失败');
    }
  }

  // 删除提醒事项
  async deleteReminder(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.apiClient.delete(`/${id}`);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '删除提醒事项失败');
    }
  }

  // 获取统计信息
  async getReminderStats(): Promise<ApiResponse<ReminderStats>> {
    try {
      const response = await this.apiClient.get('/stats');
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取统计信息失败');
    }
  }
}

export default new ReminderService();
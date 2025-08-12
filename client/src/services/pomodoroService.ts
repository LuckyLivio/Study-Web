import api from './api';

// 接口类型定义
export interface PomodoroSession {
  _id: string;
  type: '工作' | '短休息' | '长休息';
  duration: number; // 持续时间（分钟）
  actualDuration: number; // 实际完成时间（分钟）
  isCompleted: boolean;
  task?: string;
  category: '工作' | '学习' | '阅读' | '编程' | '其他';
  startTime: string;
  endTime?: string;
  pausedTime: number; // 暂停总时长（秒）
  interruptions: number; // 中断次数
  notes?: string;
  createdAt: string;
}

export interface PomodoroStats {
  period: string;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  totalFocusTime: number; // 分钟
  totalFocusHours: number; // 小时
  avgInterruptions: number;
  typeStats: Array<{ _id: string; count: number; totalTime: number; completedCount: number }>;
  categoryStats: Array<{ _id: string; count: number; totalTime: number }>;
  dailyStats: Array<{
    _id: { year: number; month: number; day: number };
    sessions: number;
    completedSessions: number;
    focusTime: number;
  }>;
}

export interface PomodoroQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
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
  sessions: T[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

class PomodoroService {
  private apiClient = {
    get: (url: string, config?: any) => api.get(`/pomodoro${url}`, config),
    post: (url: string, data?: any, config?: any) => api.post(`/pomodoro${url}`, data, config),
    put: (url: string, data?: any, config?: any) => api.put(`/pomodoro${url}`, data, config),
    delete: (url: string, config?: any) => api.delete(`/pomodoro${url}`, config),
  };

  // 获取番茄钟会话记录
  async getSessions(params?: PomodoroQueryParams): Promise<ApiResponse<PaginatedResponse<PomodoroSession>>> {
    try {
      const response = await this.apiClient.get('/sessions', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取会话记录失败');
    }
  }

  // 开始新的番茄钟会话
  async startSession(sessionData: {
    type: '工作' | '短休息' | '长休息';
    duration: number;
    task?: string;
    category?: '工作' | '学习' | '阅读' | '编程' | '其他';
  }): Promise<ApiResponse<PomodoroSession>> {
    try {
      const response = await this.apiClient.post('/sessions', sessionData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '开始会话失败');
    }
  }

  // 完成番茄钟会话
  async completeSession(id: string, data: {
    notes?: string;
    interruptions?: number;
    pausedTime?: number;
  }): Promise<ApiResponse<PomodoroSession>> {
    try {
      const response = await this.apiClient.put(`/sessions/${id}/complete`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '完成会话失败');
    }
  }

  // 取消番茄钟会话
  async cancelSession(id: string, reason?: string): Promise<ApiResponse<PomodoroSession>> {
    try {
      const response = await this.apiClient.put(`/sessions/${id}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '取消会话失败');
    }
  }

  // 更新会话信息
  async updateSession(id: string, sessionData: Partial<PomodoroSession>): Promise<ApiResponse<PomodoroSession>> {
    try {
      const response = await this.apiClient.put(`/sessions/${id}`, sessionData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新会话失败');
    }
  }

  // 删除会话
  async deleteSession(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.apiClient.delete(`/sessions/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除会话失败');
    }
  }

  // 获取统计信息
  async getPomodoroStats(period: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<PomodoroStats>> {
    try {
      const response = await this.apiClient.get('/stats', { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取统计信息失败');
    }
  }
}

export default new PomodoroService();
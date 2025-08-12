import api from './api';

// 接口类型定义
export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: '低' | '中' | '高';
  category: '工作' | '学习' | '生活' | '其他';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  dueToday: number;
  overdue: number;
  completionRate: number;
  priorityStats: Array<{ _id: string; count: number }>;
  categoryStats: Array<{ _id: string; count: number }>;
}

export interface TodoQueryParams {
  page?: number;
  limit?: number;
  completed?: boolean;
  priority?: string;
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
  todos: T[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

class TodoService {
  private apiClient = {
    get: (url: string, config?: any) => api.get(`/todos${url}`, config),
    post: (url: string, data?: any, config?: any) => api.post(`/todos${url}`, data, config),
    put: (url: string, data?: any, config?: any) => api.put(`/todos${url}`, data, config),
    patch: (url: string, data?: any, config?: any) => api.patch(`/todos${url}`, data, config),
    delete: (url: string, config?: any) => api.delete(`/todos${url}`, config),
  };

  // 获取待办事项列表
  async getTodos(params?: TodoQueryParams): Promise<ApiResponse<PaginatedResponse<Todo>>> {
    try {
      const response = await this.apiClient.get('/', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取待办事项失败');
    }
  }

  // 创建待办事项
  async createTodo(todoData: Partial<Todo>): Promise<ApiResponse<Todo>> {
    try {
      const response = await this.apiClient.post('/', todoData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建待办事项失败');
    }
  }

  // 更新待办事项
  async updateTodo(id: string, todoData: Partial<Todo>): Promise<ApiResponse<Todo>> {
    try {
      const response = await this.apiClient.put(`/${id}`, todoData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新待办事项失败');
    }
  }

  // 切换完成状态
  async toggleTodo(id: string): Promise<ApiResponse<Todo>> {
    try {
      const response = await this.apiClient.patch(`/${id}/toggle`, {});
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '切换状态失败');
    }
  }

  // 删除待办事项
  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.apiClient.delete(`/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除待办事项失败');
    }
  }

  // 批量删除已完成的待办事项
  async deleteCompleted(): Promise<ApiResponse<void>> {
    try {
      const response = await this.apiClient.delete('/completed/batch');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '批量删除失败');
    }
  }

  // 获取统计信息
  async getTodoStats(): Promise<ApiResponse<TodoStats>> {
    try {
      const response = await this.apiClient.get('/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取统计信息失败');
    }
  }
}

export default new TodoService();
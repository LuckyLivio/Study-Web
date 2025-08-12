import api from './api';

export interface StudyNote {
  _id?: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  category: '课堂笔记' | '复习总结' | '知识点整理' | '错题集' | '其他';
  difficulty: '简单' | '中等' | '困难';
  isPublic: boolean;
  viewCount?: number;
  likeCount?: number;
  attachments?: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    uploadDate: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyMaterial {
  _id?: string;
  title: string;
  description?: string;
  subject: string;
  category: '课件' | '教材' | '习题集' | '参考资料' | '视频教程' | '其他';
  fileInfo: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
  tags: string[];
  difficulty: '入门' | '基础' | '中级' | '高级';
  isPublic: boolean;
  downloadCount?: number;
  rating?: {
    average: number;
    count: number;
  };
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyPlan {
  _id?: string;
  title: string;
  description?: string;
  subject: string;
  type: '学习计划' | '复习计划' | '考试准备' | '作业提醒' | '其他';
  priority: '低' | '中' | '高' | '紧急';
  status: '未开始' | '进行中' | '已完成' | '已延期' | '已取消';
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours?: number;
  progress: number;
  reminders: Array<{
    _id?: string;
    date: string;
    message: string;
    isActive: boolean;
    isSent: boolean;
  }>;
  tasks: Array<{
    _id?: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    completedAt?: string;
    estimatedMinutes: number;
  }>;
  tags: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  subject?: string;
  category?: string;
  search?: string;
  status?: string;
  priority?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

// 学习笔记相关API
export const studyNotesApi = {
  // 获取笔记列表
  getNotes: (params?: PaginationParams): Promise<ApiResponse<StudyNote[]>> => {
    return api.get('/study/notes', { params });
  },

  // 获取单个笔记详情
  getNoteById: (id: string): Promise<ApiResponse<StudyNote>> => {
    return api.get(`/study/notes/${id}`);
  },

  // 创建笔记
  createNote: (formData: FormData): Promise<ApiResponse<StudyNote>> => {
    return api.post('/study/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 更新笔记
  updateNote: (id: string, formData: FormData): Promise<ApiResponse<StudyNote>> => {
    return api.put(`/study/notes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 删除笔记
  deleteNote: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/study/notes/${id}`);
  },
};

// 学习资料相关API
export const studyMaterialsApi = {
  // 获取资料列表
  getMaterials: (params?: PaginationParams): Promise<ApiResponse<StudyMaterial[]>> => {
    return api.get('/study/materials', { params });
  },

  // 上传资料
  uploadMaterial: (formData: FormData): Promise<ApiResponse<StudyMaterial>> => {
    return api.post('/study/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 下载资料
  downloadMaterial: (id: string): Promise<Blob> => {
    return api.get(`/study/materials/${id}/download`, {
      responseType: 'blob',
    });
  },

  // 删除资料
  deleteMaterial: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/study/materials/${id}`);
  },
};

// 学习计划相关API
export const studyPlansApi = {
  // 获取计划列表
  getPlans: (params?: PaginationParams): Promise<ApiResponse<StudyPlan[]>> => {
    return api.get('/study/plans', { params });
  },

  // 创建计划
  createPlan: (plan: Omit<StudyPlan, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StudyPlan>> => {
    return api.post('/study/plans', plan);
  },

  // 更新计划
  updatePlan: (id: string, plan: Partial<StudyPlan>): Promise<ApiResponse<StudyPlan>> => {
    return api.put(`/study/plans/${id}`, plan);
  },

  // 更新任务状态
  updateTaskStatus: (planId: string, data: { taskIndex: number }): Promise<ApiResponse<StudyPlan>> => {
    return api.put(`/study/plans/${planId}/tasks`, data);
  },

  // 删除计划
  deletePlan: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/study/plans/${id}`);
  },

  // 获取即将到期的提醒
  getUpcomingReminders: (): Promise<ApiResponse<any[]>> => {
    return api.get('/study/reminders/upcoming');
  },
};
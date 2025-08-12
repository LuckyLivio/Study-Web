import api from './api';

export interface Portfolio {
  _id?: string;
  title: string;
  description: string;
  category: '插画' | '贴纸' | '编程项目' | '设计作品' | '其他';
  tags: string[];
  images: Array<{
    url: string;
    caption?: string;
    isMain: boolean;
  }>;
  projectUrl?: string;
  githubUrl?: string;
  technologies?: string[];
  status: '进行中' | '已完成' | '暂停';
  featured: boolean;
  viewCount?: number;
  likeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  status?: string;
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

// 作品集相关API
export const portfolioApi = {
  // 获取作品列表
  getPortfolios: (params?: PaginationParams): Promise<ApiResponse<Portfolio[]>> => {
    return api.get('/portfolio', { params });
  },

  // 获取单个作品详情
  getPortfolioById: (id: string): Promise<ApiResponse<Portfolio>> => {
    return api.get(`/portfolio/${id}`);
  },

  // 创建作品
  createPortfolio: (formData: FormData): Promise<ApiResponse<Portfolio>> => {
    return api.post('/portfolio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 更新作品
  updatePortfolio: (id: string, formData: FormData): Promise<ApiResponse<Portfolio>> => {
    return api.put(`/portfolio/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 删除作品
  deletePortfolio: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/portfolio/${id}`);
  },

  // 切换精选状态
  toggleFeatured: (id: string): Promise<ApiResponse<Portfolio>> => {
    return api.patch(`/portfolio/${id}/featured`);
  },

  // 增加浏览量
  incrementView: (id: string): Promise<ApiResponse<void>> => {
    return api.patch(`/portfolio/${id}/view`);
  },

  // 点赞/取消点赞
  toggleLike: (id: string): Promise<ApiResponse<Portfolio>> => {
    return api.patch(`/portfolio/${id}/like`);
  },
};
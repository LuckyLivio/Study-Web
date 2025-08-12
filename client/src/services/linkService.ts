import api from './api';

export interface ExternalLink {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  category: '社交媒体' | '代码仓库' | '学习平台' | '工具网站' | '个人主页' | '其他';
  platform: 'GitHub' | 'B站' | 'Notion' | '小红书' | 'CSDN' | '知乎' | 'QQ' | '微信' | '微博' | '抖音' | '其他';
  icon: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  clickCount?: number;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LinkStats {
  total: number;
  active: number;
  totalClicks: number;
  byCategory: Array<{ _id: string; count: number }>;
  byPlatform: Array<{ _id: string; count: number }>;
}

export interface LinkMetadata {
  categories: string[];
  platforms: string[];
}

export interface LinkQueryParams {
  category?: string;
  platform?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 外部链接相关API
export const linkService = {
  // 获取公开链接
  getPublicLinks: (params?: LinkQueryParams): Promise<ApiResponse<{ all: ExternalLink[]; grouped: Record<string, ExternalLink[]> }>> => {
    return api.get('/links/public', { params });
  },

  // 记录点击
  recordClick: (id: string): Promise<ApiResponse<{ clickCount: number }>> => {
    return api.post(`/links/${id}/click`);
  },

  // 获取元数据
  getMetadata: (): Promise<ApiResponse<LinkMetadata>> => {
    return api.get('/links/metadata');
  },

  // 管理员接口
  admin: {
    // 获取所有链接
    getAllLinks: (params?: LinkQueryParams): Promise<ApiResponse<ExternalLink[]>> => {
      return api.get('/links', { params });
    },

    // 创建链接
    createLink: (link: Omit<ExternalLink, '_id' | 'createdAt' | 'updatedAt' | 'clickCount'>): Promise<ApiResponse<ExternalLink>> => {
      return api.post('/links', link);
    },

    // 更新链接
    updateLink: (id: string, link: Partial<ExternalLink>): Promise<ApiResponse<ExternalLink>> => {
      return api.put(`/links/${id}`, link);
    },

    // 删除链接
    deleteLink: (id: string): Promise<ApiResponse<void>> => {
      return api.delete(`/links/${id}`);
    },

    // 批量更新排序
    updateOrder: (links: Array<{ id: string; order: number }>): Promise<ApiResponse<void>> => {
      return api.put('/links/order/batch', { links });
    },

    // 获取链接统计
    getLinkStats: (): Promise<ApiResponse<LinkStats>> => {
      return api.get('/links/stats');
    }
  }
};

export default linkService;
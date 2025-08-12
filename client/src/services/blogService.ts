import api from './api';

// 博客接口 - 使用统一的api实例
const blogApi = {
  get: (url: string, config?: any) => api.get(`/blog${url}`, config),
  post: (url: string, data?: any, config?: any) => api.post(`/blog${url}`, data, config),
  put: (url: string, data?: any, config?: any) => api.put(`/blog${url}`, data, config),
  delete: (url: string, config?: any) => api.delete(`/blog${url}`, config),
};

// 博客数据类型
export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  category: string;
  status: '草稿' | '已发布' | '私密';
  isPublic: boolean;
  views: number;
  likes: number;
  author: string;
  publishedAt?: string;
  featuredImage?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  formattedCreatedAt?: string;
  formattedPublishedAt?: string;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string;
  category: string;
  status: '草稿' | '已发布' | '私密';
  isPublic: boolean;
  featuredImage?: File;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BlogListResponse {
  blogs: Blog[];
  pagination: {
    current: number;
    total: number;
    count: number;
    limit: number;
  };
}

export interface TagCloudItem {
  tag: string;
  count: number;
}

export interface BlogStats {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  categoryStats: { _id: string; count: number }[];
}

// 博客API服务
export const blogService = {
  // 获取博客列表
  async getBlogs(params: BlogListParams = {}): Promise<BlogListResponse> {
    const response = await blogApi.get('/', { params });
    return response.data.data;
  },

  // 获取博客详情
  async getBlog(id: string): Promise<Blog> {
    const response = await blogApi.get(`/${id}`);
    return response.data.data;
  },

  // 创建博客
  async createBlog(data: BlogFormData): Promise<Blog> {
    if (data.featuredImage) {
      // 有图片时使用 FormData
      const formData = new FormData();
      
      // 添加文本字段
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'featuredImage' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      // 添加图片文件
      formData.append('featuredImage', data.featuredImage);
      
      const response = await blogApi.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } else {
      // 没有图片时使用 JSON
      const { featuredImage, ...jsonData } = data;
      const response = await blogApi.post('/', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.data;
    }
  },

  // 更新博客
  async updateBlog(id: string, data: BlogFormData): Promise<Blog> {
    const formData = new FormData();
    
    // 添加文本字段
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'featuredImage' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // 添加图片文件
    if (data.featuredImage) {
      formData.append('featuredImage', data.featuredImage);
    }
    
    const response = await blogApi.put(`/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // 删除博客
  async deleteBlog(id: string): Promise<void> {
    await blogApi.delete(`/${id}`);
  },

  // 点赞博客
  async likeBlog(id: string): Promise<{ likes: number }> {
    const response = await blogApi.post(`/${id}/like`);
    return response.data.data;
  },

  // 获取分类列表
  async getCategories(): Promise<string[]> {
    const response = await blogApi.get('/meta/categories');
    return response.data.data;
  },

  // 获取标签云
  async getTagCloud(): Promise<TagCloudItem[]> {
    const response = await blogApi.get('/meta/tags');
    return response.data.data;
  },

  // 获取博客统计
  async getBlogStats(): Promise<BlogStats> {
    const response = await blogApi.get('/meta/stats');
    return response.data.data;
  },
};

export default blogService;
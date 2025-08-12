import api from './api';

export interface Message {
  _id?: string;
  content: string;
  type: '建议' | '反馈' | '问题' | '其他';
  isAnonymous: boolean;
  contact?: {
    email?: string;
    qq?: string;
    wechat?: string;
  };
  status: '待处理' | '处理中' | '已回复' | '已关闭';
  isPublic: boolean;
  reply?: {
    content: string;
    repliedAt: string;
    repliedBy: string;
  };
  likes: number;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageStats {
  total: number;
  public: number;
  pending: number;
  replied: number;
  byType: Array<{ _id: string; count: number }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}

// 留言相关API
export const messageService = {
  // 获取公开留言
  getPublicMessages: (params?: PaginationParams): Promise<ApiResponse<Message[]>> => {
    return api.get('/messages/public', { params });
  },

  // 创建留言
  createMessage: (message: Omit<Message, '_id' | 'createdAt' | 'updatedAt' | 'likes' | 'status'>): Promise<ApiResponse<Message>> => {
    return api.post('/messages', message);
  },

  // 点赞留言
  likeMessage: (id: string): Promise<ApiResponse<{ likes: number }>> => {
    return api.post(`/messages/${id}/like`);
  },

  // 管理员接口
  admin: {
    // 获取所有留言
    getAllMessages: (params?: PaginationParams): Promise<ApiResponse<Message[]>> => {
      return api.get('/messages/admin', { params });
    },

    // 回复留言
    replyMessage: (id: string, content: string): Promise<ApiResponse<Message>> => {
      return api.post(`/messages/${id}/reply`, { content });
    },

    // 更新留言状态
    updateMessageStatus: (id: string, data: { status?: string; isPublic?: boolean }): Promise<ApiResponse<Message>> => {
      return api.put(`/messages/${id}/status`, data);
    },

    // 删除留言
    deleteMessage: (id: string): Promise<ApiResponse<void>> => {
      return api.delete(`/messages/${id}`);
    },

    // 获取留言统计
    getMessageStats: (): Promise<ApiResponse<MessageStats>> => {
      return api.get('/messages/stats');
    }
  }
};

export default messageService;
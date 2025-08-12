import api from './api';

// 接口类型定义
export interface EmojiData {
  emoji: string;
  category: string;
}

export interface EmojiCategory {
  category: string;
  emojis: string[];
}

export interface StudyTip {
  tip: string;
  category: string;
}

export interface StudyTipCategory {
  category: string;
  tips: string[];
}

export interface MotivationalQuote {
  quote: string;
  timestamp: string;
}

export interface RandomColor {
  color: string;
  format: string;
  rgb: { r: number; g: number; b: number };
  hex: string;
}

export interface TimeInfo {
  timestamp: number;
  iso: string;
  local: string;
  date: string;
  time: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
  timezone: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

class ToolsService {
  private apiClient = {
    get: (url: string, config?: any) => api.get(`/tools${url}`, config),
    post: (url: string, data?: any, config?: any) => api.post(`/tools${url}`, data, config),
    put: (url: string, data?: any, config?: any) => api.put(`/tools${url}`, data, config),
    delete: (url: string, config?: any) => api.delete(`/tools${url}`, config),
  };

  // 获取表情包
  async getEmojis(category?: string): Promise<ApiResponse<{
    categories?: string[];
    allEmojis?: Record<string, string[]>;
    category?: string;
    emojis?: string[];
  }>> {
    try {
      const response = await this.apiClient.get('/emojis', { params: { category } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取表情包失败');
    }
  }

  // 随机获取表情
  async getRandomEmoji(category?: string): Promise<ApiResponse<EmojiData>> {
    try {
      const response = await this.apiClient.get('/emojis/random', { params: { category } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取随机表情失败');
    }
  }

  // 获取学习贴士
  async getStudyTips(category?: string): Promise<ApiResponse<{
    categories?: string[];
    allTips?: StudyTipCategory[];
    category?: string;
    tips?: string[];
  }>> {
    try {
      const response = await this.apiClient.get('/study-tips', { params: { category } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取学习贴士失败');
    }
  }

  // 随机获取学习贴士
  async getRandomStudyTip(category?: string): Promise<ApiResponse<StudyTip>> {
    try {
      const response = await this.apiClient.get('/study-tips/random', { params: { category } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取随机学习贴士失败');
    }
  }

  // 获取励志名言
  async getMotivationalQuote(): Promise<ApiResponse<MotivationalQuote>> {
    try {
      const response = await this.apiClient.get('/quote');
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取励志名言失败');
    }
  }

  // 生成随机颜色
  async getRandomColor(format: 'hex' | 'rgb' | 'hsl' = 'hex'): Promise<ApiResponse<RandomColor>> {
    try {
      const response = await this.apiClient.get('/color/random', { params: { format } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '生成随机颜色失败');
    }
  }

  // 获取时间信息
  async getTimeInfo(timezone: string = 'Asia/Shanghai'): Promise<ApiResponse<TimeInfo>> {
    try {
      const response = await this.apiClient.get('/time', { params: { timezone } });
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.data?.message || '获取时间信息失败');
    }
  }
}

export default new ToolsService();
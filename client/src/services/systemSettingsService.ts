import api from './api';

// 系统设置接口类型定义
export interface SiteInfo {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteLogo?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface SystemConfig {
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: 'user' | 'admin';
  maxLoginAttempts: number;
  sessionTimeout: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  defaultPageSize: number;
}

export interface Features {
  enableBlog: boolean;
  enablePortfolio: boolean;
  enableChat: boolean;
  enableReminders: boolean;
  enablePomodoro: boolean;
  enableStudyPlans: boolean;
  enableExternalLinks: boolean;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultTheme: 'light' | 'dark' | 'auto';
}

export interface Maintenance {
  enabled: boolean;
  message: string;
  allowedIPs: string[];
}

export interface SystemSettings {
  _id?: string;
  siteInfo: SiteInfo;
  systemConfig: SystemConfig;
  features: Features;
  emailConfig: EmailConfig;
  themeConfig: ThemeConfig;
  maintenance: Maintenance;
  lastUpdatedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicSettings {
  siteInfo: Pick<SiteInfo, 'siteName' | 'siteDescription' | 'siteLogo' | 'favicon'>;
  themeConfig: ThemeConfig;
  features: Features;
  maintenance: Pick<Maintenance, 'enabled' | 'message'>;
}

export interface SystemStats {
  users: {
    total: number;
    admins: number;
    active: number;
    inactive: number;
  };
  system: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
}

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 系统设置服务
export const systemSettingsService = {
  // 获取公开的系统设置（不需要认证）
  async getPublicSettings(): Promise<PublicSettings> {
    try {
      const response: ApiResponse<PublicSettings> = await api.get('/settings/public');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || '获取公开设置失败');
    } catch (error: any) {
      console.error('获取公开设置失败:', error);
      throw new Error(error.response?.data?.message || '获取公开设置失败');
    }
  },

  // 获取完整的系统设置（需要管理员权限）
  async getSettings(): Promise<SystemSettings> {
    try {
      const response: ApiResponse<SystemSettings> = await api.get('/settings/');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || '获取系统设置失败');
    } catch (error: any) {
      console.error('获取系统设置失败:', error);
      throw new Error(error.response?.data?.message || '获取系统设置失败');
    }
  },

  // 更新系统设置
  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response: ApiResponse<SystemSettings> = await api.put('/settings/', settings);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || '更新系统设置失败');
    } catch (error: any) {
      console.error('更新系统设置失败:', error);
      throw new Error(error.response?.data?.message || '更新系统设置失败');
    }
  },

  // 重置系统设置为默认值
  async resetSettings(): Promise<SystemSettings> {
    try {
      const response: ApiResponse<SystemSettings> = await api.post('/settings/reset');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || '重置系统设置失败');
    } catch (error: any) {
      console.error('重置系统设置失败:', error);
      throw new Error(error.response?.data?.message || '重置系统设置失败');
    }
  },

  // 测试邮件配置
  async testEmailConfig(testEmail: string): Promise<string> {
    try {
      const response: ApiResponse<string> = await api.post('/settings/test-email', { testEmail });
      if (response.success) {
        return response.message || '测试邮件发送成功';
      }
      throw new Error(response.message || '测试邮件发送失败');
    } catch (error: any) {
      console.error('测试邮件配置失败:', error);
      throw new Error(error.response?.data?.message || '测试邮件配置失败');
    }
  },

  // 获取系统统计信息
  async getSystemStats(): Promise<SystemStats> {
    try {
      const response: ApiResponse<SystemStats> = await api.get('/settings/stats');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || '获取系统统计失败');
    } catch (error: any) {
      console.error('获取系统统计失败:', error);
      throw new Error(error.response?.data?.message || '获取系统统计失败');
    }
  }
};

export default systemSettingsService;
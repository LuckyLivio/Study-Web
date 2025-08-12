import api from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000/api';
console.log('API_BASE_URL:', API_BASE_URL);

// 用户数据类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  profile: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    website?: string;
    location?: string;
    phone?: string;
    avatar?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'zh' | 'en';
    notifications: {
      email: boolean;
      browser: boolean;
    };
  };
  fullName: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
  loginCount?: number;
  createdAt: string;
}

export interface LoginData {
  email: string; // 可以是邮箱或用户名
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface UserStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    recentUsers: number;
    inactiveUsers: number;
  };
}

class AuthService {
  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    
    const responseData = response.data || response;
    if (responseData && responseData.success) {
      // 保存token和用户信息
      const authData = responseData.data || responseData;
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }
    
    return response.data || response;
  }

  // 用户登录
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
    const response = await api.post('/auth/login', data);
    
    const responseData = response.data || response;
    if (responseData && responseData.success) {
      // 保存token和用户信息
      const authData = responseData.data || responseData;
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    }
    
    return response.data || response;
  }

  // 用户登出
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // 获取当前用户信息
  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.get('/auth/profile');
    
    const responseData = response.data || response;
    if (responseData && responseData.success) {
      // 更新本地存储的用户信息
      const userData = responseData.data || responseData;
      localStorage.setItem('user', JSON.stringify(userData.user));
    }
    
    return response.data || response;
  }

  // 更新用户资料
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; data: { user: User } }> {
    const response = await api.put('/auth/profile', data);
    
    const responseData = response.data || response;
    if (responseData && responseData.success) {
      // 更新本地存储的用户信息
      const userData = responseData.data || responseData;
      localStorage.setItem('user', JSON.stringify(userData.user));
    }
    
    return response.data || response;
  }

  // 修改密码
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data || response;
  }

  // 验证token
  async verifyToken(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.get('/auth/verify');
    return response.data || response;
  }

  // 获取本地存储的token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 获取本地存储的用户信息
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // 检查是否是管理员
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // ==================== 管理员功能 ====================

  // 获取用户列表（管理员）
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
  } = {}): Promise<UserListResponse> {
    const response = await api.get('/auth/admin/users', { params });
    return response.data || response;
  }

  // 更新用户状态（管理员）
  async updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/auth/admin/users/${userId}/status`, { isActive });
    return response.data || response;
  }

  // 更新用户角色（管理员）
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/auth/admin/users/${userId}/role`, { role });
    return response.data || response;
  }

  // 删除用户（管理员）
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/auth/admin/users/${userId}`);
    return response.data || response;
  }

  // 获取用户统计信息（管理员）
  async getUserStats(): Promise<UserStatsResponse> {
    const response = await api.get('/auth/admin/stats');
    return response.data || response;
  }
}

export const authService = new AuthService();
export default authService;
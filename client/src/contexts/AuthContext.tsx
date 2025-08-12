import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.verifyToken();
        if (response.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('AuthContext: 开始登录请求', { email });
      const response = await authService.login({ email, password });
      console.log('AuthContext: 登录响应', response);
      // 如果成功，设置用户信息
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      console.log('AuthContext: 登录成功，用户信息已设置');
    } catch (error: any) {
      console.error('AuthContext: 登录失败', error);
      // 重新抛出错误，让调用方能够获取具体的错误信息
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || '登录失败，请稍后重试');
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }): Promise<boolean> => {
    try {
      // 将fullName分解为firstName和lastName
      const nameParts = userData.fullName ? userData.fullName.split(' ') : [];
      const registerData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      };
      
      const response = await authService.register(registerData);
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('token');
    
    // 尝试调用服务器端logout，但忽略错误
    try {
      await authService.logout();
    } catch (error) {
      // 忽略logout错误，因为客户端状态已经清理
      console.log('Server logout failed, but client state cleared');
    }
    
    // 退出登录后跳转到登录页面
    window.location.href = '/login';
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
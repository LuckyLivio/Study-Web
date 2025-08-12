import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // 返回一个标准化的错误响应格式
    return Promise.reject({
      data: {
        success: false,
        message: error.response?.data?.message || error.message || '请求失败',
        error: error.response?.data?.error || 'NETWORK_ERROR'
      }
    });
  }
);

export default api;
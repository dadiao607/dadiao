import axios from 'axios';
import { useUserStore } from '@/store/user';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
http.interceptors.request.use(
  config => {
    const userStore = useUserStore();
    const token = userStore.token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 如果返回的数据格式是统一的API响应格式，则直接返回data部分
    if (response.data.hasOwnProperty('success')) {
      const { success, message, data } = response.data;
      
      if (success) {
        return data;
      } else {
        return Promise.reject(new Error(message || 'Error'));
      }
    }
    return response.data;
  },
  error => {
    const userStore = useUserStore();
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          userStore.logout();
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('无权限访问');
          break;
        case 404:
          // 资源不存在
          console.error('请求资源不存在');
          break;
        default:
          // 其他错误
          console.error(error.response.data.message || '请求失败');
      }
    } else {
      console.error('网络错误，请检查您的网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default http; 
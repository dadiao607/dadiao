import { defineStore } from 'pinia';
import router from '@/router';

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    email: 'admin@library.com',
    role: 'ADMIN'
  },
  {
    id: 2,
    username: 'reader',
    password: 'reader123',
    name: '普通读者',
    email: 'reader@example.com',
    role: 'READER'
  }
];

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    userId: (state) => state.user?.id,
    username: (state) => state.user?.username,
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(credentials) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟登录验证
        const user = mockUsers.find(
          u => u.username === credentials.username && 
               u.password === credentials.password
        );
        
        if (!user) {
          throw new Error('用户名或密码错误');
        }
        
        // 创建模拟token
        const token = `mock-token-${Date.now()}`;
        
        // 去除密码信息
        const { password, ...userWithoutPassword } = user;
        
        this.token = token;
        this.user = userWithoutPassword;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        return userWithoutPassword;
      } catch (error) {
        this.error = error.message || '登录失败';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      try {
        this.loading = true;
        this.error = null;
        
        // 检查用户名是否已存在
        if (mockUsers.some(u => u.username === userData.username)) {
          throw new Error('用户名已存在');
        }
        
        // 创建新用户
        const newUser = {
          id: mockUsers.length + 1,
          ...userData,
          role: 'READER',
        };
        
        // 添加到模拟数据
        mockUsers.push(newUser);
        
        return { success: true };
      } catch (error) {
        this.error = error.message || '注册失败';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    
    async logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return true;
    },
    
    async checkAuth() {
      if (this.token && this.user) {
        return true;
      }
      return false;
    },
    
    initializeAuth() {
      // 从本地存储中恢复用户会话
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      }
    }
  }
}); 
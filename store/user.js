import { defineStore } from 'pinia';

// 模拟数据 - 用户列表
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    email: 'admin@library.com',
    phone: '13800138000',
    address: '北京市海淀区中关村大街1号',
    role: 'ADMIN',
    active: true,
    createdAt: '2023-04-01T08:00:00Z',
    updatedAt: '2023-04-01T08:00:00Z'
  },
  {
    id: 2,
    username: 'reader',
    name: 'Normal Reader',
    email: 'reader@example.com',
    phone: '13900139000',
    address: '上海市浦东新区张江高科技园区',
    role: 'READER',
    active: true,
    createdAt: '2023-04-05T10:15:00Z',
    updatedAt: '2023-04-05T10:15:00Z'
  },
  {
    id: 3,
    username: 'zhang_san',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13700137000',
    address: '广州市天河区珠江新城',
    role: 'READER',
    active: true,
    createdAt: '2023-04-10T14:25:00Z',
    updatedAt: '2023-04-10T14:25:00Z'
  }
];

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 20,
      total: 0,
      totalPages: 0
    }
  }),
  
  getters: {
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === Number(id)) || null;
    }
  },
  
  actions: {
    async fetchUsers({ page = 0, size = 20, query = '', role = '' } = {}) {
      try {
        this.loading = true;
        
        // 使用模拟数据
        this.users = [...mockUsers];
        this.pagination = {
          page,
          size,
          total: mockUsers.length,
          totalPages: Math.ceil(mockUsers.length / size)
        };
        
        return {
          content: this.users,
          pageable: this.pagination
        };
      } catch (error) {
        this.error = '获取用户列表失败';
        console.error(error);
        return { content: [], pageable: this.pagination };
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserById(id) {
      try {
        this.loading = true;
        
        // 从模拟数据中查找
        const user = mockUsers.find(user => user.id === Number(id));
        if (!user) {
          throw new Error('用户不存在');
        }
        
        this.currentUser = user;
        return user;
      } catch (error) {
        this.error = '获取用户信息失败';
        console.error(error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async createUser(userData) {
      try {
        this.loading = true;
        
        // 创建新用户
        const newUser = {
          ...userData,
          id: Math.floor(Math.random() * 1000) + 10,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 添加到列表
        mockUsers.push(newUser);
        
        return newUser;
      } catch (error) {
        this.error = '创建用户失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateUser(id, userData) {
      try {
        this.loading = true;
        
        // 查找并更新用户
        const userIndex = mockUsers.findIndex(user => user.id === Number(id));
        if (userIndex === -1) {
          throw new Error('用户不存在');
        }
        
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };
        
        return mockUsers[userIndex];
      } catch (error) {
        this.error = '更新用户失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUser(id) {
      try {
        this.loading = true;
        
        // 查找用户
        const userIndex = mockUsers.findIndex(user => user.id === Number(id));
        if (userIndex === -1) {
          throw new Error('用户不存在');
        }
        
        // 从列表中移除
        mockUsers.splice(userIndex, 1);
        
        return true;
      } catch (error) {
        this.error = '删除用户失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProfile(userData) {
      try {
        this.loading = true;
        
        // 更新当前用户
        return await this.updateUser(1, userData);
      } catch (error) {
        this.error = '更新个人资料失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async changePassword(passwordData) {
      try {
        this.loading = true;
        
        // 模拟修改密码
        return true;
      } catch (error) {
        this.error = '修改密码失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 
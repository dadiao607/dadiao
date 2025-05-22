import { defineStore } from 'pinia';

// 模拟数据 - 借阅记录
const mockBorrows = [
  {
    id: 1,
    userId: 1,
    bookId: 1,
    bookTitle: 'Java Programming',
    userName: '系统管理员',
    borrowDate: '2023-05-10',
    dueDate: '2023-06-10',
    returnDate: null,
    status: 'BORROWED',
    notes: '',
    createdAt: '2023-05-10T10:30:00Z',
    updatedAt: '2023-05-10T10:30:00Z'
  },
  {
    id: 2,
    userId: 1,
    bookId: 2,
    bookTitle: 'Three Body Problem',
    userName: '系统管理员',
    borrowDate: '2023-05-12',
    dueDate: '2023-06-12',
    returnDate: '2023-05-25',
    status: 'RETURNED',
    notes: '按时归还',
    createdAt: '2023-05-12T14:20:00Z',
    updatedAt: '2023-05-25T09:15:00Z'
  },
  {
    id: 3,
    userId: 2,
    bookId: 3,
    bookTitle: 'Sapiens',
    userName: 'Normal Reader',
    borrowDate: '2023-05-15',
    dueDate: '2023-06-15',
    returnDate: null,
    status: 'BORROWED',
    notes: '',
    createdAt: '2023-05-15T11:45:00Z',
    updatedAt: '2023-05-15T11:45:00Z'
  }
];

export const useBorrowStore = defineStore('borrow', {
  state: () => ({
    borrows: [],
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 20,
      totalItems: 0,
      totalPages: 0
    }
  }),
  
  actions: {
    async fetchBorrows({ page = 0, size = 20, status = '', query = '', sort = '' } = {}) {
      try {
        this.loading = true;
        
        // 使用模拟数据
        this.borrows = [...mockBorrows];
        this.pagination = {
          page,
          size,
          totalItems: mockBorrows.length,
          totalPages: Math.ceil(mockBorrows.length / size)
        };
        
        return {
          content: this.borrows,
          pageable: this.pagination
        };
      } catch (error) {
        this.error = '获取借阅记录失败';
        console.error(error);
        return { content: [], pageable: this.pagination };
      } finally {
        this.loading = false;
      }
    },
    
    async fetchMyBorrows({ page = 0, size = 20, status = '' } = {}) {
      try {
        this.loading = true;
        
        // 使用模拟数据中用户ID为1的记录
        const myBorrows = mockBorrows.filter(borrow => borrow.userId === 1);
        this.borrows = myBorrows;
        this.pagination = {
          page,
          size,
          totalItems: myBorrows.length,
          totalPages: Math.ceil(myBorrows.length / size)
        };
        
        return {
          content: this.borrows,
          pageable: this.pagination
        };
      } catch (error) {
        this.error = '获取我的借阅记录失败';
        console.error(error);
        return { content: [], pageable: this.pagination };
      } finally {
        this.loading = false;
      }
    },
    
    async borrowBook(bookId) {
      try {
        this.loading = true;
        
        // 创建新借阅记录
        const newBorrow = {
          id: Math.floor(Math.random() * 1000) + 100,
          userId: 1,
          bookId: bookId,
          bookTitle: '新借阅图书',
          userName: '系统管理员',
          borrowDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returnDate: null,
          status: 'BORROWED',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 添加到列表
        mockBorrows.push(newBorrow);
        
        return newBorrow;
      } catch (error) {
        this.error = '借阅图书失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async returnBook(borrowId) {
      try {
        this.loading = true;
        
        // 查找并更新记录
        const borrowIndex = mockBorrows.findIndex(b => b.id === borrowId);
        if (borrowIndex !== -1) {
          mockBorrows[borrowIndex] = {
            ...mockBorrows[borrowIndex],
            returnDate: new Date().toISOString().split('T')[0],
            status: 'RETURNED',
            updatedAt: new Date().toISOString()
          };
          
          return mockBorrows[borrowIndex];
        }
        
        throw new Error('借阅记录不存在');
      } catch (error) {
        this.error = '归还图书失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async approveBorrow(borrowId, approved = true) {
      try {
        this.loading = true;
        
        // 查找并更新记录
        const borrowIndex = mockBorrows.findIndex(b => b.id === borrowId);
        if (borrowIndex !== -1) {
          mockBorrows[borrowIndex] = {
            ...mockBorrows[borrowIndex],
            status: approved ? 'BORROWED' : 'REJECTED',
            updatedAt: new Date().toISOString()
          };
          
          return mockBorrows[borrowIndex];
        }
        
        throw new Error('借阅记录不存在');
      } catch (error) {
        this.error = approved ? '批准借阅失败' : '拒绝借阅失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 
import { defineStore } from 'pinia';

// 模拟数据 - 图书列表
const mockBooks = [
  {
    id: 1,
    title: 'Java Programming',
    author: 'James Gosling',
    isbn: '9787111213826',
    description: 'Essential Java programming book',
    category: 'TECHNOLOGY',
    publicationYear: 2007,
    publisher: 'O\'Reilly',
    totalCopies: 5,
    availableCopies: 5,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-10T10:20:30Z',
    updatedAt: '2023-05-10T10:20:30Z'
  },
  {
    id: 2,
    title: 'Three Body Problem',
    author: 'Liu Cixin',
    isbn: '9787536692930',
    description: 'Famous sci-fi novel',
    category: 'FICTION',
    publicationYear: 2008,
    publisher: 'Chongqing Press',
    totalCopies: 10,
    availableCopies: 8,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-11T10:20:30Z',
    updatedAt: '2023-05-11T10:20:30Z'
  },
  {
    id: 3,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '9787508660752',
    description: 'A Brief History of Humankind',
    category: 'HISTORY',
    publicationYear: 2014,
    publisher: 'Harper',
    totalCopies: 3,
    availableCopies: 3,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-12T10:20:30Z',
    updatedAt: '2023-05-12T10:20:30Z'
  },
  {
    id: 4,
    title: 'How Steel Was Tempered',
    author: 'Nikolai Ostrovsky',
    isbn: '9787506369756',
    description: 'Classic novel',
    category: 'FICTION',
    publicationYear: 1934,
    publisher: 'Foreign Literature Press',
    totalCopies: 8,
    availableCopies: 8,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-13T10:20:30Z',
    updatedAt: '2023-05-13T10:20:30Z'
  },
  {
    id: 5,
    title: 'The Art of Computer Programming',
    author: 'Donald Knuth',
    isbn: '9787121139512',
    description: 'Fundamental algorithms',
    category: 'TECHNOLOGY',
    publicationYear: 2011,
    publisher: 'Addison-Wesley',
    totalCopies: 6,
    availableCopies: 6,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-14T10:20:30Z',
    updatedAt: '2023-05-14T10:20:30Z'
  },
  {
    id: 6,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9787020090006',
    description: 'Classic English novel',
    category: 'FICTION',
    publicationYear: 1947,
    publisher: 'Penguin Classics',
    totalCopies: 4,
    availableCopies: 4,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-15T10:20:30Z',
    updatedAt: '2023-05-15T10:20:30Z'
  },
  {
    id: 7,
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel Garcia Marquez',
    isbn: '9787544253994',
    description: 'Magical realism masterpiece',
    category: 'FICTION',
    publicationYear: 1967,
    publisher: 'Harper',
    totalCopies: 7,
    availableCopies: 7, 
    imageUrl: '',
    active: true,
    createdAt: '2023-05-16T10:20:30Z',
    updatedAt: '2023-05-16T10:20:30Z'
  },
  {
    id: 8,
    title: 'To Live',
    author: 'Yu Hua',
    isbn: '9787506365437',
    description: 'Modern Chinese literature',
    category: 'FICTION',
    publicationYear: 1993,
    publisher: 'Anchor',
    totalCopies: 5,
    availableCopies: 5,
    imageUrl: '',
    active: true,
    createdAt: '2023-05-17T10:20:30Z',
    updatedAt: '2023-05-17T10:20:30Z'
  }
];

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [],
    popularBooks: [],
    book: null,
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
    getBookById: (state) => (id) => {
      return state.books.find(book => book.id === Number(id)) || null;
    }
  },
  
  actions: {
    async fetchBooks({ page = 0, size = 20, query = '', category = '', onlyAvailable = false, sort = 'newest' } = {}) {
      try {
        this.loading = true;
        
        // 使用模拟数据
        this.books = [...mockBooks];
        this.pagination = {
          page: page,
          size: size,
          total: mockBooks.length,
          totalPages: Math.ceil(mockBooks.length / size)
        };
        
        return this.books;
      } catch (error) {
        this.error = '获取图书列表失败';
        console.error(error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchBookById(id) {
      try {
        this.loading = true;
        
        // 从模拟数据中查找
        const foundBook = mockBooks.find(book => book.id === Number(id));
        if (foundBook) {
          this.book = foundBook;
          return foundBook;
        }
        
        throw new Error('图书不存在');
      } catch (error) {
        this.error = '获取图书详情失败';
        console.error(error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchPopularBooks(limit = 8) {
      try {
        this.loading = true;
        
        // 使用模拟数据的前几项作为热门图书
        this.popularBooks = mockBooks.slice(0, limit);
        return this.popularBooks;
      } catch (error) {
        this.error = '获取热门图书失败';
        console.error(error);
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async createBook(bookData) {
      try {
        this.loading = true;
        return { ...bookData, id: Math.floor(Math.random() * 1000) + 10 };
      } catch (error) {
        this.error = '添加图书失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateBook(id, bookData) {
      try {
        this.loading = true;
        return { ...bookData, id: Number(id) };
      } catch (error) {
        this.error = '更新图书失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteBook(id) {
      try {
        this.loading = true;
        return true;
      } catch (error) {
        this.error = '删除图书失败';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 
import http from './http';

/**
 * 获取所有图书
 * @returns {Promise<Array>} 图书列表
 */
export function getAllBooks() {
  return http.get('/books');
}

/**
 * 获取指定ID的图书
 * @param {number} id - 图书ID
 * @returns {Promise<Object>} 图书详情
 */
export function getBookById(id) {
  return http.get(`/books/${id}`);
}

/**
 * 按分类获取图书
 * @param {string} category - 图书分类
 * @returns {Promise<Array>} 图书列表
 */
export function getBooksByCategory(category) {
  return http.get(`/books/category/${category}`);
}

/**
 * 搜索图书
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 搜索结果
 */
export function searchBooks(keyword) {
  return http.get('/books/search', {
    params: { keyword }
  });
}

/**
 * 获取可借阅图书
 * @returns {Promise<Array>} 可借阅图书列表
 */
export function getAvailableBooks() {
  return http.get('/books/available');
}

/**
 * 创建新图书 (管理员)
 * @param {Object} book - 图书信息
 * @returns {Promise<Object>} 创建的图书
 */
export function createBook(book) {
  return http.post('/books', book);
}

/**
 * 更新图书信息 (管理员)
 * @param {number} id - 图书ID
 * @param {Object} book - 图书信息
 * @returns {Promise<Object>} 更新后的图书
 */
export function updateBook(id, book) {
  return http.put(`/books/${id}`, book);
}

/**
 * 删除图书 (管理员)
 * @param {number} id - 图书ID
 * @returns {Promise<void>}
 */
export function deleteBook(id) {
  return http.delete(`/books/${id}`);
} 
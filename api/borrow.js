import http from './http';

/**
 * 创建借阅请求
 * @param {Object} data - 借阅信息
 * @returns {Promise<Object>} 创建的借阅记录
 */
export function createBorrowRequest(data) {
  return http.post('/borrows', data);
}

/**
 * 获取借阅记录详情
 * @param {number} id - 借阅记录ID
 * @returns {Promise<Object>} 借阅记录详情
 */
export function getBorrowRecordById(id) {
  return http.get(`/borrows/${id}`);
}

/**
 * 获取所有借阅记录 (管理员)
 * @returns {Promise<Array>} 借阅记录列表
 */
export function getAllBorrowRecords() {
  return http.get('/borrows');
}

/**
 * 获取用户的借阅记录
 * @param {number} userId - 用户ID
 * @returns {Promise<Array>} 用户的借阅记录列表
 */
export function getBorrowRecordsByUserId(userId) {
  return http.get(`/borrows/user/${userId}`);
}

/**
 * 获取图书的借阅记录
 * @param {number} bookId - 图书ID
 * @returns {Promise<Array>} 图书的借阅记录列表
 */
export function getBorrowRecordsByBookId(bookId) {
  return http.get(`/borrows/book/${bookId}`);
}

/**
 * 根据状态获取借阅记录
 * @param {string} status - 借阅状态
 * @returns {Promise<Array>} 借阅记录列表
 */
export function getBorrowRecordsByStatus(status) {
  return http.get(`/borrows/status/${status}`);
}

/**
 * 获取逾期记录 (管理员)
 * @returns {Promise<Array>} 逾期记录列表
 */
export function getOverdueRecords() {
  return http.get('/borrows/overdue');
}

/**
 * 获取用户当前借阅
 * @param {number} userId - 用户ID
 * @returns {Promise<Array>} 用户当前借阅列表
 */
export function getCurrentBorrowsByUserId(userId) {
  return http.get(`/borrows/current/user/${userId}`);
}

/**
 * 批准借阅请求 (管理员)
 * @param {number} id - 借阅记录ID
 * @returns {Promise<Object>} 更新后的借阅记录
 */
export function approveBorrowRequest(id) {
  return http.put(`/borrows/${id}/approve`);
}

/**
 * 拒绝借阅请求 (管理员)
 * @param {number} id - 借阅记录ID
 * @returns {Promise<Object>} 更新后的借阅记录
 */
export function rejectBorrowRequest(id) {
  return http.put(`/borrows/${id}/reject`);
}

/**
 * 归还图书 (管理员)
 * @param {number} id - 借阅记录ID
 * @returns {Promise<Object>} 更新后的借阅记录
 */
export function returnBook(id) {
  return http.put(`/borrows/${id}/return`);
}

/**
 * 报告图书丢失 (管理员)
 * @param {number} id - 借阅记录ID
 * @returns {Promise<Object>} 更新后的借阅记录
 */
export function reportLostBook(id) {
  return http.put(`/borrows/${id}/lost`);
}

/**
 * 获取用户活跃借阅数量
 * @param {number} userId - 用户ID
 * @returns {Promise<number>} 活跃借阅数量
 */
export function countActiveBorrowsByUserId(userId) {
  return http.get(`/borrows/count/user/${userId}`);
} 
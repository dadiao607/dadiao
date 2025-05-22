import http from './http';

/**
 * 获取用户详情
 * @param {number} id - 用户ID
 * @returns {Promise<Object>} 用户详情
 */
export function getUserById(id) {
  return http.get(`/users/${id}`);
}

/**
 * 获取所有用户 (管理员)
 * @returns {Promise<Array>} 用户列表
 */
export function getAllUsers() {
  return http.get('/users');
}

/**
 * 按角色获取用户 (管理员)
 * @param {string} role - 角色名称
 * @returns {Promise<Array>} 用户列表
 */
export function getUsersByRole(role) {
  return http.get(`/users/role/${role}`);
}

/**
 * 创建新用户 (管理员)
 * @param {Object} user - 用户信息
 * @returns {Promise<Object>} 创建的用户
 */
export function createUser(user) {
  return http.post('/users', user);
}

/**
 * 更新用户信息 (管理员)
 * @param {number} id - 用户ID
 * @param {Object} user - 用户信息
 * @returns {Promise<Object>} 更新后的用户
 */
export function updateUser(id, user) {
  return http.put(`/users/${id}`, user);
}

/**
 * 删除用户 (管理员)
 * @param {number} id - 用户ID
 * @returns {Promise<void>}
 */
export function deleteUser(id) {
  return http.delete(`/users/${id}`);
}

/**
 * 切换用户状态 (管理员)
 * @param {number} id - 用户ID
 * @returns {Promise<Object>} 更新后的用户
 */
export function toggleUserStatus(id) {
  return http.put(`/users/${id}/toggle-status`);
}

/**
 * 更新个人资料
 * @param {number} id - 用户ID
 * @param {Object} profile - 个人资料
 * @returns {Promise<Object>} 更新后的用户
 */
export function updateProfile(id, profile) {
  return http.put(`/users/${id}/profile`, profile);
}

/**
 * 修改密码
 * @param {number} id - 用户ID
 * @param {Object} passwords - 包含旧密码和新密码的对象
 * @returns {Promise<void>}
 */
export function changePassword(id, passwords) {
  return http.put(`/users/${id}/change-password`, passwords);
} 
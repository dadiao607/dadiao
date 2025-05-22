import http from './http';

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} 登录成功后的用户信息和token
 */
export function login(data) {
  return http.post('/auth/login', data);
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @returns {Promise<Object>} 注册成功后的用户信息和token
 */
export function register(data) {
  return http.post('/auth/register', data);
}

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 当前登录用户的详细信息
 */
export function getCurrentUser() {
  return http.get('/users/me');
} 
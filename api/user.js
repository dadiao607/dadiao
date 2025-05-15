import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/auth/info',
    method: 'get'
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/auth/password',
    method: 'put',
    data
  })
}

// 获取用户权限列表
export function getUserPermissions() {
  return request({
    url: '/api/user/permissions',
    method: 'get'
  })
}

// 获取用户操作日志
export function getUserLogs(params) {
  return request({
    url: '/api/user/logs',
    method: 'get',
    params
  })
} 
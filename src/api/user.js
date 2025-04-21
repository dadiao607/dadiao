import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 登出
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}

// 获取用户权限列表
export function getUserPermissions() {
  return request({
    url: '/user/permissions',
    method: 'get'
  })
}

// 获取用户操作日志
export function getUserLogs(params) {
  return request({
    url: '/user/logs',
    method: 'get',
    params
  })
} 
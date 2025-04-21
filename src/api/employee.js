import request from '@/utils/request'

// 获取员工列表
export function getEmployeeList(params) {
  return request({
    url: '/employee/list',
    method: 'get',
    params
  })
}

// 获取员工详情
export function getEmployeeDetail(id) {
  return request({
    url: `/employee/${id}`,
    method: 'get'
  })
}

// 新增员工
export function addEmployee(data) {
  return request({
    url: '/employee',
    method: 'post',
    data
  })
}

// 更新员工信息
export function updateEmployee(data) {
  return request({
    url: `/employee/${data.id}`,
    method: 'put',
    data
  })
}

// 删除员工
export function deleteEmployee(id) {
  return request({
    url: `/employee/${id}`,
    method: 'delete'
  })
}

// 获取员工排班
export function getEmployeeSchedule(params) {
  return request({
    url: '/employee/schedule',
    method: 'get',
    params
  })
}

// 安排员工排班
export function scheduleEmployee(data) {
  return request({
    url: '/employee/schedule',
    method: 'post',
    data
  })
}

// 更新排班
export function updateSchedule(data) {
  return request({
    url: `/employee/schedule/${data.id}`,
    method: 'put',
    data
  })
}

// 删除排班
export function deleteSchedule(id) {
  return request({
    url: `/employee/schedule/${id}`,
    method: 'delete'
  })
}

// 获取员工绩效
export function getEmployeePerformance(params) {
  return request({
    url: '/employee/performance',
    method: 'get',
    params
  })
}

// 记录员工绩效
export function recordPerformance(data) {
  return request({
    url: '/employee/performance',
    method: 'post',
    data
  })
}

// 获取员工班次
export function getShifts() {
  return request({
    url: '/employee/shifts',
    method: 'get'
  })
}

// 添加班次
export function addShift(data) {
  return request({
    url: '/employee/shift',
    method: 'post',
    data
  })
}

// 更新班次
export function updateShift(data) {
  return request({
    url: `/employee/shift/${data.id}`,
    method: 'put',
    data
  })
} 
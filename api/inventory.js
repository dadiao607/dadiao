import request from '@/utils/request'

// 获取库存列表
export function getInventoryList(params) {
  return request({
    url: '/inventory/list',
    method: 'get',
    params
  })
}

// 获取库存详情
export function getInventoryDetail(id) {
  return request({
    url: `/inventory/${id}`,
    method: 'get'
  })
}

// 新增库存
export function addInventory(data) {
  return request({
    url: '/inventory',
    method: 'post',
    data
  })
}

// 更新库存
export function updateInventory(data) {
  return request({
    url: `/inventory/${data.id}`,
    method: 'put',
    data
  })
}

// 删除库存
export function deleteInventory(id) {
  return request({
    url: `/inventory/${id}`,
    method: 'delete'
  })
}

// 入库记录
export function addInventoryIn(data) {
  return request({
    url: '/inventory/in',
    method: 'post',
    data
  })
}

// 获取入库历史
export function getInventoryInHistory(params) {
  return request({
    url: '/inventory/in/history',
    method: 'get',
    params
  })
}

// 出库记录
export function addInventoryOut(data) {
  return request({
    url: '/inventory/out',
    method: 'post',
    data
  })
}

// 获取出库历史
export function getInventoryOutHistory(params) {
  return request({
    url: '/inventory/out/history',
    method: 'get',
    params
  })
}

// 获取库存预警列表
export function getInventoryAlerts() {
  return request({
    url: '/inventory/alerts',
    method: 'get'
  })
}

// 设置库存预警阈值
export function setInventoryAlert(data) {
  return request({
    url: '/inventory/alert/threshold',
    method: 'post',
    data
  })
}
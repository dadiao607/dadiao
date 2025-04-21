import request from '@/utils/request'

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data
  })
}

// 更新订单
export function updateOrder(data) {
  return request({
    url: `/order/${data.id}`,
    method: 'put',
    data
  })
}

// 删除订单
export function deleteOrder(id) {
  return request({
    url: `/order/${id}`,
    method: 'delete'
  })
}

// 支付订单
export function payOrder(data) {
  return request({
    url: `/order/pay/${data.id}`,
    method: 'post',
    data
  })
}

// 取消订单
export function cancelOrder(id, reason) {
  return request({
    url: `/order/cancel/${id}`,
    method: 'post',
    data: { reason }
  })
}

// 获取历史订单
export function getOrderHistory(params) {
  return request({
    url: '/order/history',
    method: 'get',
    params
  })
}

// 获取菜单项列表
export function getMenuItems(params) {
  return request({
    url: '/menu/items',
    method: 'get',
    params
  })
}

// 根据订单ID获取订单项
export function getOrderItems(orderId) {
  return request({
    url: `/order/items/${orderId}`,
    method: 'get'
  })
}

// 添加订单项
export function addOrderItem(data) {
  return request({
    url: '/order/item',
    method: 'post',
    data
  })
}

// 删除订单项
export function deleteOrderItem(id) {
  return request({
    url: `/order/item/${id}`,
    method: 'delete'
  })
}

// 更新订单项数量
export function updateOrderItemQuantity(id, quantity) {
  return request({
    url: `/order/item/${id}/quantity`,
    method: 'put',
    data: { quantity }
  })
} 
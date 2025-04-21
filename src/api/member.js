import request from '@/utils/request'

// 获取会员列表
export function getMemberList(params) {
  return request({
    url: '/member/list',
    method: 'get',
    params
  })
}

// 获取会员详情
export function getMemberDetail(id) {
  return request({
    url: `/member/${id}`,
    method: 'get'
  })
}

// 新增会员
export function addMember(data) {
  return request({
    url: '/member',
    method: 'post',
    data
  })
}

// 更新会员信息
export function updateMember(data) {
  return request({
    url: `/member/${data.id}`,
    method: 'put',
    data
  })
}

// 删除会员
export function deleteMember(id) {
  return request({
    url: `/member/${id}`,
    method: 'delete'
  })
}

// 获取会员积分历史
export function getMemberPoints(id, params) {
  return request({
    url: `/member/${id}/points`,
    method: 'get',
    params
  })
}

// 添加会员积分
export function addMemberPoints(data) {
  return request({
    url: '/member/points/add',
    method: 'post',
    data
  })
}

// 扣减会员积分
export function deductMemberPoints(data) {
  return request({
    url: '/member/points/deduct',
    method: 'post',
    data
  })
}

// 获取会员等级列表
export function getMemberLevels() {
  return request({
    url: '/member/levels',
    method: 'get'
  })
}

// 设置会员等级
export function setMemberLevel(data) {
  return request({
    url: '/member/level',
    method: 'post',
    data
  })
}

// 获取会员活动列表
export function getMemberActivities(params) {
  return request({
    url: '/member/activities',
    method: 'get',
    params
  })
}

// 创建会员活动
export function createMemberActivity(data) {
  return request({
    url: '/member/activity',
    method: 'post',
    data
  })
}

// 更新会员活动
export function updateMemberActivity(data) {
  return request({
    url: `/member/activity/${data.id}`,
    method: 'put',
    data
  })
}

// 删除会员活动
export function deleteMemberActivity(id) {
  return request({
    url: `/member/activity/${id}`,
    method: 'delete'
  })
}

// 向会员推送活动
export function pushActivityToMembers(data) {
  return request({
    url: '/member/activity/push',
    method: 'post',
    data
  })
} 
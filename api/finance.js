import request from '@/utils/request'

// 获取日营收统计
export function getDailyRevenue(date) {
  return request({
    url: '/finance/daily',
    method: 'get',
    params: { date }
  })
}

// 获取周营收统计
export function getWeeklyRevenue(startDate, endDate) {
  return request({
    url: '/finance/weekly',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取月营收统计
export function getMonthlyRevenue(year, month) {
  return request({
    url: '/finance/monthly',
    method: 'get',
    params: { year, month }
  })
}

// 获取年度营收统计
export function getYearlyRevenue(year) {
  return request({
    url: '/finance/yearly',
    method: 'get',
    params: { year }
  })
}

// 获取成本分析
export function getCostAnalysis(startDate, endDate) {
  return request({
    url: '/finance/cost/analysis',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取利润分析
export function getProfitAnalysis(startDate, endDate) {
  return request({
    url: '/finance/profit/analysis',
    method: 'get',
    params: { startDate, endDate }
  })
}

// 记录支出
export function recordExpense(data) {
  return request({
    url: '/finance/expense',
    method: 'post',
    data
  })
}

// 获取支出列表
export function getExpenseList(params) {
  return request({
    url: '/finance/expenses',
    method: 'get',
    params
  })
}

// 更新支出记录
export function updateExpense(data) {
  return request({
    url: `/finance/expense/${data.id}`,
    method: 'put',
    data
  })
}

// 删除支出记录
export function deleteExpense(id) {
  return request({
    url: `/finance/expense/${id}`,
    method: 'delete'
  })
}

// 获取热销商品统计
export function getHotSalesStats(params) {
  return request({
    url: '/finance/stats/hot-sales',
    method: 'get',
    params
  })
}

// 导出财务报表
export function exportFinanceReport(params) {
  return request({
    url: '/finance/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
} 
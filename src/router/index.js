import { createRouter, createWebHistory } from 'vue-router'

// 布局组件
const Layout = () => import('@/layout/index.vue')

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hideInMenu: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      }
    ]
  },
  {
    path: '/inventory',
    component: Layout,
    redirect: '/inventory/list',
    meta: { title: '库存管理', icon: 'Box' },
    children: [
      {
        path: 'list',
        name: 'InventoryList',
        component: () => import('@/views/inventory/list.vue'),
        meta: { title: '库存列表' }
      },
      {
        path: 'in',
        name: 'InventoryIn',
        component: () => import('@/views/inventory/in.vue'),
        meta: { title: '入库管理' }
      },
      {
        path: 'out',
        name: 'InventoryOut',
        component: () => import('@/views/inventory/out.vue'),
        meta: { title: '出库记录' }
      },
      {
        path: 'alert',
        name: 'InventoryAlert',
        component: () => import('@/views/inventory/alert.vue'),
        meta: { title: '库存预警' }
      }
    ]
  },
  /* 暂时注释掉订单管理模块，等待相关页面开发完成
  {
    path: '/order',
    component: Layout,
    redirect: '/order/list',
    meta: { title: '订单管理', icon: 'ShoppingCart' },
    children: [
      {
        path: 'new',
        name: 'OrderNew',
        component: () => import('@/views/order/new.vue'),
        meta: { title: '新建订单' }
      },
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list.vue'),
        meta: { title: '订单列表' }
      },
      {
        path: 'history',
        name: 'OrderHistory',
        component: () => import('@/views/order/history.vue'),
        meta: { title: '历史订单' }
      }
    ]
  },
  */
  /* 暂时注释掉员工管理模块，等待相关页面开发完成
  {
    path: '/employee',
    component: Layout,
    redirect: '/employee/list',
    meta: { title: '员工管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'EmployeeList',
        component: () => import('@/views/employee/list.vue'),
        meta: { title: '员工列表' }
      },
      {
        path: 'schedule',
        name: 'EmployeeSchedule',
        component: () => import('@/views/employee/schedule.vue'),
        meta: { title: '排班管理' }
      },
      {
        path: 'performance',
        name: 'EmployeePerformance',
        component: () => import('@/views/employee/performance.vue'),
        meta: { title: '绩效统计' }
      }
    ]
  },
  */
  /* 暂时注释掉会员管理模块，等待相关页面开发完成
  {
    path: '/member',
    component: Layout,
    redirect: '/member/list',
    meta: { title: '会员管理', icon: 'Star' },
    children: [
      {
        path: 'list',
        name: 'MemberList',
        component: () => import('@/views/member/list.vue'),
        meta: { title: '会员列表' }
      },
      {
        path: 'points',
        name: 'MemberPoints',
        component: () => import('@/views/member/points.vue'),
        meta: { title: '积分管理' }
      },
      {
        path: 'activity',
        name: 'MemberActivity',
        component: () => import('@/views/member/activity.vue'),
        meta: { title: '活动管理' }
      }
    ]
  },
  */
  /* 暂时注释掉财务管理模块，等待相关页面开发完成
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/daily',
    meta: { title: '财务管理', icon: 'Money' },
    children: [
      {
        path: 'daily',
        name: 'FinanceDaily',
        component: () => import('@/views/finance/daily.vue'),
        meta: { title: '日营收统计' }
      },
      {
        path: 'weekly',
        name: 'FinanceWeekly',
        component: () => import('@/views/finance/weekly.vue'),
        meta: { title: '周营收统计' }
      },
      {
        path: 'monthly',
        name: 'FinanceMonthly',
        component: () => import('@/views/finance/monthly.vue'),
        meta: { title: '月营收统计' }
      },
      {
        path: 'analysis',
        name: 'FinanceAnalysis',
        component: () => import('@/views/finance/analysis.vue'),
        meta: { title: '成本分析' }
      }
    ]
  },
  */
  /* 暂时注释掉系统设置模块，等待相关页面开发完成
  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/index',
    children: [
      {
        path: 'index',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  },
  */
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hideInMenu: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 酒吧管理系统` : '酒吧管理系统'
  
  // 登录验证
  const token = localStorage.getItem('token')
  if (to.path !== '/login') {
    if (!token) {
      next('/login')
    } else {
      next()
    }
  } else {
    if (token) {
      next('/')
    } else {
      next()
    }
  }
})

export default router 
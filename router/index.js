import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

// 页面组件
import Home from '../views/Home.vue';
import BookList from '../views/book/BookList.vue';
import BookDetail from '../views/book/BookDetail.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import MyBorrows from '../views/reader/MyBorrows.vue';
import Profile from '../views/reader/Profile.vue';
import Dashboard from '../views/admin/Dashboard.vue';
import BookManagement from '../views/admin/BookManagement.vue';
import UserManagement from '../views/admin/UserManagement.vue';
import BorrowManagement from '../views/admin/BorrowManagement.vue';

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/books',
    name: 'books',
    component: BookList
  },
  {
    path: '/books/:id',
    name: 'book-detail',
    component: BookDetail,
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/my-borrows',
    name: 'my-borrows',
    component: MyBorrows
  },
  {
    path: '/reader/profile',
    name: 'reader-profile',
    component: Profile
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: Dashboard
  },
  {
    path: '/admin/books',
    name: 'admin-books',
    component: BookManagement
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: UserManagement
  },
  {
    path: '/admin/borrows',
    name: 'admin-borrows',
    component: BorrowManagement
  },
  {
    // 404页面
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue')
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 页面切换时滚动到顶部
    return { top: 0 };
  }
});

// 导航守卫 - 简化版，不再进行登录验证
router.beforeEach((to, from, next) => {
  next();
});

export default router; 
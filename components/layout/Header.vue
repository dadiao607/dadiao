<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo and Title -->
      <div class="logo-container">
        <router-link to="/">
          <div class="logo">
            <i class="el-icon library-icon"><Reading /></i>
            <span class="logo-text">图书馆管理系统</span>
          </div>
        </router-link>
      </div>
      
      <!-- Navigation Menu -->
      <div class="nav-menu">
        <el-menu
          mode="horizontal"
          :ellipsis="false"
          :router="true"
          :default-active="activeRoute">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/books">图书目录</el-menu-item>
          
          <!-- 读者菜单 - 登录后显示 -->
          <template v-if="isLoggedIn && !isAdmin">
            <el-menu-item index="/my-borrows">我的借阅</el-menu-item>
          </template>
          
          <!-- 管理员菜单 - 仅管理员可见 -->
          <template v-if="isAdmin">
            <el-sub-menu index="/admin">
              <template #title>管理后台</template>
              <el-menu-item index="/admin/dashboard">控制台</el-menu-item>
              <el-menu-item index="/admin/books">图书管理</el-menu-item>
              <el-menu-item index="/admin/users">用户管理</el-menu-item>
              <el-menu-item index="/admin/borrows">借阅管理</el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </div>
      
      <!-- User Actions -->
      <div class="user-actions">
        <template v-if="isLoggedIn">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :icon="UserFilled" />
              <span class="username">访客用户</span>
              <el-icon><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="borrows">
                  <el-icon><Document /></el-icon>
                  我的借阅
                </el-dropdown-item>
                <el-dropdown-item command="dashboard">
                  <el-icon><DataBoard /></el-icon>
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <template v-else>
          <el-button 
            type="primary" 
            plain 
            class="login-button"
            @click="router.push('/login')">
            登录
          </el-button>
          <el-button
            class="register-button"
            @click="router.push('/register')">
            注册
          </el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { ElMessageBox } from 'element-plus';
import { 
  Reading, 
  User, 
  UserFilled, 
  Document, 
  SwitchButton, 
  CaretBottom,
  DataBoard
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 计算属性：当前路由
const activeRoute = computed(() => route.path);

// 计算属性：是否已登录
const isLoggedIn = computed(() => authStore.isLoggedIn);

// 计算属性：是否是管理员
const isAdmin = computed(() => authStore.isAdmin);

// 计算属性：用户名
const username = computed(() => {
  const user = authStore.currentUser;
  return user ? (user.name || user.username) : '';
});

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    // 用户取消退出
  }
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/reader/profile');
      break;
    case 'borrows':
      router.push('/my-borrows');
      break;
    case 'dashboard':
      router.push('/admin/dashboard');
      break;
    case 'logout':
      logout();
      break;
  }
};
</script>

<style scoped>
.app-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  color: #409EFF;
  font-size: 20px;
  font-weight: bold;
}

.library-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  margin-left: 8px;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu :deep(.el-menu) {
  border-bottom: none;
}

.nav-menu :deep(.el-menu--horizontal .el-menu-item) {
  font-size: 15px;
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }
  
  .nav-menu {
    justify-content: flex-start;
  }
  
  .username {
    display: none;
  }
}
</style> 
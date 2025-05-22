<template>
  <div class="reader-layout">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="logo">
        <h1>图书馆管理系统</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        mode="horizontal"
        background-color="#ffffff"
        text-color="#333333"
        active-text-color="#409EFF"
        class="main-menu">
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          首页
        </el-menu-item>
        <el-menu-item index="/books">
          <el-icon><Reading /></el-icon>
          图书浏览
        </el-menu-item>
        <el-menu-item index="/my-borrows" v-if="isLoggedIn">
          <el-icon><Document /></el-icon>
          我的借阅
        </el-menu-item>
      </el-menu>
      <div class="user-actions">
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              {{ username }} <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" size="small" @click="login">登录</el-button>
          <el-button type="default" size="small" @click="register">注册</el-button>
        </template>
      </div>
    </el-header>

    <!-- 内容区域 -->
    <el-main class="main">
      <router-view />
    </el-main>

    <!-- 页脚 -->
    <el-footer class="footer">
      <p>© 2023 图书馆管理系统 版权所有</p>
    </el-footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { HomeFilled, Reading, Document, CaretBottom } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 用户登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn);
const username = computed(() => userStore.username);

// 当前激活的菜单
const activeMenu = computed(() => route.path);

// 登录
const login = () => {
  router.push('/login');
};

// 注册
const register = () => {
  router.push('/register');
};

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout();
      router.push('/home');
      ElMessage.success('退出登录成功');
    }).catch(() => {});
  }
};
</script>

<style scoped>
.reader-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  padding: 0 20px;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.logo {
  height: 60px;
  line-height: 60px;
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  width: 220px;
}

.logo h1 {
  font-size: 18px;
  margin: 0;
}

.main-menu {
  flex: 1;
  justify-content: center;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.main {
  padding: 80px 20px 20px;
  flex: 1;
  background-color: #f0f2f5;
}

.footer {
  text-align: center;
  padding: 15px 0;
  background-color: #f0f2f5;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 14px;
}
</style> 
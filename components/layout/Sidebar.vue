<template>
  <div class="sidebar-container" :class="{ 'sidebar-collapsed': isCollapsed }">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :router="true"
      class="sidebar-menu"
      :collapse-transition="false">
      
      <!-- 管理员菜单 -->
      <template v-if="isAdmin">
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>控制台</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/books">
          <el-icon><Reading /></el-icon>
          <template #title>图书管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/borrows">
          <el-icon><Document /></el-icon>
          <template #title>借阅管理</template>
        </el-menu-item>
        
        <el-sub-menu index="settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          
          <el-menu-item index="/admin/categories">
            <el-icon><Collection /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          
          <el-menu-item index="/admin/system">
            <el-icon><Tools /></el-icon>
            <span>系统参数</span>
          </el-menu-item>
        </el-sub-menu>
      </template>
      
      <!-- 读者菜单 -->
      <template v-else>
        <el-menu-item index="/reader/profile">
          <el-icon><User /></el-icon>
          <template #title>个人资料</template>
        </el-menu-item>
        
        <el-menu-item index="/my-borrows">
          <el-icon><Document /></el-icon>
          <template #title>我的借阅</template>
        </el-menu-item>
        
        <el-menu-item index="/books">
          <el-icon><Reading /></el-icon>
          <template #title>图书目录</template>
        </el-menu-item>
        
        <el-menu-item index="/reader/favorites">
          <el-icon><Star /></el-icon>
          <template #title>我的收藏</template>
        </el-menu-item>
        
        <el-menu-item index="/reader/messages">
          <el-icon><Message /></el-icon>
          <template #title>我的消息</template>
        </el-menu-item>
      </template>
    </el-menu>
    
    <!-- 折叠按钮 -->
    <div class="collapse-button" @click="toggleCollapse">
      <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import {
  DataBoard,
  Reading,
  User,
  Document,
  Setting,
  Collection,
  Tools,
  Star,
  Message,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue';

const route = useRoute();
const authStore = useAuthStore();

// 侧边栏是否折叠
const isCollapsed = ref(false);

// 当前激活的菜单项
const activeMenu = computed(() => {
  return route.path;
});

// 是否是管理员
const isAdmin = computed(() => {
  return authStore.isAdmin;
});

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  position: fixed;
  left: 0;
  top: 60px; /* 与顶部导航栏高度一致 */
  bottom: 0;
  width: 220px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
  overflow-y: auto;
  z-index: 999;
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.collapse-button {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
}

.collapse-button:hover {
  color: #409EFF;
}
</style> 
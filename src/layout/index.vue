<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const route = useRoute()
const mainClass = computed(() => {
  return {
    'main-container': true,
    'has-tags-view': true
  }
})
</script>

<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <Sidebar :is-collapse="isCollapse" class="sidebar-container" />
    
    <!-- 主容器 -->
    <div class="main-wrapper">
      <!-- 顶部导航 -->
      <Navbar @toggle-sidebar="toggleSidebar" />
      
      <!-- 主内容 -->
      <div :class="mainClass">
        <!-- 面包屑 -->
        <div class="breadcrumb-container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in route.matched" :key="index" 
                                v-if="item.meta && item.meta.title && !item.meta.hideInMenu">
              {{ item.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <!-- 内容区域 -->
        <div class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  
  .sidebar-container {
    transition: width 0.28s;
    width: 210px;
    background-color: #304156;
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    
    &.is-collapse {
      width: 64px;
    }
  }
  
  .main-wrapper {
    min-height: 100%;
    width: calc(100% - 210px);
    margin-left: 210px;
    position: relative;
    transition: margin-left 0.28s;
    
    &.is-collapse {
      margin-left: 64px;
      width: calc(100% - 64px);
    }
  }
  
  .main-container {
    padding: 0 20px 20px;
    position: relative;
    
    .breadcrumb-container {
      padding: 15px 0;
      .el-breadcrumb {
        font-size: 14px;
      }
    }
    
    .app-main {
      min-height: calc(100vh - 50px - 51px);
      position: relative;
      overflow: hidden;
      
      .fade-enter-active,
      .fade-leave-active {
        transition: opacity 0.2s;
      }
      
      .fade-enter-from,
      .fade-leave-to {
        opacity: 0;
      }
    }
  }
}

@media screen and (max-width: 992px) {
  .app-wrapper {
    .sidebar-container {
      width: 64px;
    }
    
    .main-wrapper {
      margin-left: 64px;
      width: calc(100% - 64px);
    }
  }
}
</style> 
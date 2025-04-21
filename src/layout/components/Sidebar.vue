<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 属性定义
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

// 路由相关
const router = useRouter()
const route = useRoute()

// 获取路由菜单
const routes = computed(() => {
  return router.options.routes.filter(route => {
    return !route.meta || !route.meta.hideInMenu
  })
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 生成图标组件
const getIconComponent = (icon) => {
  if (!icon) return null
  return icon
}
</script>

<template>
  <div class="sidebar-menu">
    <div class="logo-container">
      <router-link to="/" class="logo-link">
        <img src="@/assets/logo.png" alt="logo" class="sidebar-logo" v-if="!isCollapse" />
        <img src="@/assets/logo-small.png" alt="logo" class="sidebar-logo-small" v-else />
      </router-link>
    </div>
    
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <template v-for="(route, index) in routes" :key="index">
          <!-- 没有子路由的菜单项 -->
          <el-menu-item 
            v-if="!route.children || route.children.length === 0 || 
              (route.children.length === 1 && !route.alwaysShow)" 
            :index="route.path">
            <el-icon v-if="route.meta && route.meta.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>
              <span>{{ route.meta ? route.meta.title : route.name }}</span>
            </template>
          </el-menu-item>
          
          <!-- 有子路由的菜单项 -->
          <el-sub-menu 
            v-else 
            :index="route.path"
            popper-class="sidebar-popper"
          >
            <template #title>
              <el-icon v-if="route.meta && route.meta.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta ? route.meta.title : route.name }}</span>
            </template>
            
            <template v-for="(child, childIndex) in route.children" :key="childIndex">
              <!-- 子菜单项 -->
              <el-menu-item 
                v-if="!child.children || child.children.length === 0"
                :index="route.path + '/' + child.path">
                <template #title>
                  <span>{{ child.meta ? child.meta.title : child.name }}</span>
                </template>
              </el-menu-item>
              
              <!-- 多级子菜单 -->
              <el-sub-menu v-else :index="route.path + '/' + child.path">
                <template #title>
                  <span>{{ child.meta ? child.meta.title : child.name }}</span>
                </template>
                
                <el-menu-item 
                  v-for="(grandson, grandsonIndex) in child.children" 
                  :key="grandsonIndex"
                  :index="route.path + '/' + child.path + '/' + grandson.path">
                  <template #title>
                    <span>{{ grandson.meta ? grandson.meta.title : grandson.name }}</span>
                  </template>
                </el-menu-item>
              </el-sub-menu>
            </template>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .logo-container {
    height: 50px;
    padding: 10px 0;
    text-align: center;
    overflow: hidden;
    
    .logo-link {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .sidebar-logo {
        width: 160px;
        height: auto;
      }
      
      .sidebar-logo-small {
        width: 30px;
        height: 30px;
      }
    }
  }
  
  .el-scrollbar {
    flex: 1;
    
    :deep(.el-menu) {
      border-right: none;
      
      .el-sub-menu .el-menu-item {
        min-width: 160px;
      }
      
      .el-menu-item, .el-sub-menu__title {
        height: 50px;
        line-height: 50px;
        
        &:hover {
          background-color: #263445 !important;
        }
        
        &.is-active {
          background-color: #263445 !important;
        }
      }
      
      .el-icon {
        margin-right: 10px;
        width: 24px;
        text-align: center;
      }
    }
  }
}

.sidebar-popper {
  background-color: #1f2d3d !important;
  
  .el-menu--popup {
    background-color: #1f2d3d;
    
    .el-menu-item {
      background-color: #1f2d3d;
      color: #bfcbd9;
      
      &:hover {
        background-color: #001528 !important;
      }
      
      &.is-active {
        color: #409EFF;
      }
    }
  }
}
</style> 
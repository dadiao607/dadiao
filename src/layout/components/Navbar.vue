<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 属性定义
const emit = defineEmits(['toggleSidebar'])

// 用户下拉菜单
const userDropdown = ref(false)

// 路由
const router = useRouter()

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

// 切换语言
const currentLang = ref('中文')
const changeLang = (lang) => {
  currentLang.value = lang
  // 实际项目中这里需要调用i18n切换语言
}
</script>

<template>
  <div class="navbar">
    <!-- 汉堡菜单 -->
    <div class="hamburger-container" @click="emit('toggleSidebar')">
      <el-icon><Fold /></el-icon>
    </div>
    
    <!-- 标题 -->
    <div class="app-title">
      酒吧管理系统
    </div>
    
    <!-- 右侧菜单 -->
    <div class="right-menu">
      <!-- 通知 -->
      <div class="right-menu-item">
        <el-badge :value="3" class="badge-item">
          <el-icon><Bell /></el-icon>
        </el-badge>
      </div>
      
      <!-- 语言切换 -->
      <el-dropdown class="right-menu-item" trigger="click" @command="changeLang">
        <div class="lang-button">
          <el-icon><Globe /></el-icon>
          <span>{{ currentLang }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="中文">中文</el-dropdown-item>
            <el-dropdown-item command="English">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 用户信息 -->
      <el-dropdown class="right-menu-item avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" class="user-avatar" />
          <span class="user-name">管理员</span>
          <el-icon><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item>
              <el-icon><Setting /></el-icon>设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    padding: 0 15px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
    
    .el-icon {
      font-size: 20px;
    }
  }
  
  .app-title {
    font-size: 18px;
    font-weight: bold;
    color: #409EFF;
    margin-left: 20px;
  }
  
  .right-menu {
    display: flex;
    align-items: center;
    margin-left: auto;
    height: 100%;
    
    .right-menu-item {
      display: inline-block;
      padding: 0 12px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;
      display: flex;
      align-items: center;
      
      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;
        
        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
      
      .badge-item {
        cursor: pointer;
      }
      
      .lang-button {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        span {
          margin-left: 5px;
          font-size: 14px;
        }
      }
    }
    
    .avatar-container {
      cursor: pointer;
      
      .avatar-wrapper {
        display: flex;
        align-items: center;
        
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
        
        .user-name {
          margin: 0 5px;
          font-size: 14px;
        }
      }
    }
  }
}
</style> 
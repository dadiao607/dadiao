<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-image">
        <el-image src="@/assets/404.png" alt="404" />
      </div>
      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">抱歉，您访问的页面不存在</h2>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="() => router.go(-1)">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  
  .error-content {
    text-align: center;
    padding: 30px;
    
    .error-image {
      margin-bottom: 30px;
      
      .el-image {
        width: 300px;
        height: auto;
      }
    }
    
    .error-title {
      font-size: 72px;
      font-weight: bold;
      color: #409EFF;
      margin-bottom: 20px;
    }
    
    .error-subtitle {
      font-size: 24px;
      color: #606266;
      margin-bottom: 30px;
    }
    
    .error-actions {
      .el-button {
        margin: 0 10px;
      }
    }
  }
}

@media screen and (max-width: 576px) {
  .error-container {
    .error-content {
      .error-image {
        .el-image {
          width: 200px;
        }
      }
      
      .error-title {
        font-size: 54px;
      }
      
      .error-subtitle {
        font-size: 18px;
      }
    }
  }
}
</style> 
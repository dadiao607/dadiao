<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">页面未找到</h1>
      <p class="not-found-message">抱歉，您访问的页面不存在或已被移除</p>
      <div class="not-found-actions">
        <el-button type="primary" @click="router.push('/')">返回首页</el-button>
        <el-button @click="router.go(-1)">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
}

.not-found-code {
  font-size: 120px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1.2;
}

.not-found-title {
  font-size: 32px;
  margin-bottom: 16px;
  color: #303133;
}

.not-found-message {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .not-found-code {
    font-size: 80px;
  }
  
  .not-found-title {
    font-size: 24px;
  }
  
  .not-found-message {
    font-size: 16px;
  }
  
  .not-found-actions {
    flex-direction: column;
    width: 200px;
    margin: 0 auto;
  }
}
</style> 
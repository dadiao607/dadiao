<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-links">
        <router-link to="/about">关于我们</router-link>
        <router-link to="/contact">联系我们</router-link>
        <router-link to="/help">帮助中心</router-link>
        <router-link to="/privacy">隐私政策</router-link>
      </div>
      <div class="copyright">
        &copy; {{ currentYear }} 图书馆管理系统 - 版权所有
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

// 获取当前年份
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  height: 60px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.footer-links {
  margin-bottom: 5px;
}

.footer-links a {
  color: #606266;
  margin: 0 10px;
  text-decoration: none;
  font-size: 14px;
}

.footer-links a:hover {
  color: #409EFF;
}

.copyright {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .footer-links a {
    margin: 0 5px;
    font-size: 12px;
  }
  
  .copyright {
    font-size: 11px;
  }
}
</style> 
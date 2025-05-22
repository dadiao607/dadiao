<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h1 class="login-title">图书馆管理系统</h1>
        <p class="login-subtitle">登录您的账户</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @submit.prevent="handleLogin">
        
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin" />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin" />
        </el-form-item>
        
        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" @click="router.push('/forgot-password')">忘记密码？</el-link>
        </div>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>还没有账户？<el-link type="primary" @click="router.push('/register')">立即注册</el-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 登录表单
const loginFormRef = ref(null);
const loginForm = reactive({
  username: '',
  password: ''
});

// 记住我
const rememberMe = ref(false);

// 表单校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// 加载状态
const loading = ref(false);

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    
    loading.value = true;
    
    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      rememberMe: rememberMe.value
    });
    
    // 登录成功
    ElMessage.success('登录成功');
    
    // 如果有重定向参数，则重定向到该页面
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (error) {
    ElMessage.error(error.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

// 自动填充用户名（如果有记住我）
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedUsername');
  if (savedUsername) {
    loginForm.username = savedUsername;
    rememberMe.value = true;
  }
});
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-form-wrapper {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
}

.login-button {
  width: 100%;
  padding: 12px 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  color: #606266;
}

@media (max-width: 480px) {
  .login-form-wrapper {
    width: 90%;
    padding: 30px 20px;
  }
}
</style> 
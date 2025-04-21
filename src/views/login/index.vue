<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 表单引用
const loginFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 登录方法
const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        // 实际项目中这里应该调用登录API
        localStorage.setItem('token', 'admin-token')
        router.push('/')
        loading.value = false
      }, 1500)
    } else {
      return false
    }
  })
}

// 切换语言
const currentLang = ref('中文')
const changeLang = (lang) => {
  currentLang.value = lang
  // 实际项目中这里需要调用i18n切换语言
}
</script>

<template>
  <div class="login-container">
    <!-- 背景 -->
    <div class="login-background"></div>
    
    <!-- 登录表单 -->
    <div class="login-form-container">
      <div class="login-form-content">
        <!-- 标题 -->
        <div class="login-title">
          <h2>酒吧管理系统</h2>
          <p>Bar Management System</p>
        </div>
        
        <!-- 表单 -->
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="用户名" 
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              placeholder="密码" 
              prefix-icon="Lock"
              type="password"
              size="large"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
              <a href="javascript:;" class="forget-pwd">忘记密码？</a>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading" 
              class="login-button"
              @click="handleLogin"
              size="large"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 底部 -->
        <div class="login-footer">
          <div class="language-switch">
            <el-dropdown @command="changeLang">
              <span class="language-text">
                <el-icon><Globe /></el-icon>
                {{ currentLang }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="中文">中文</el-dropdown-item>
                  <el-dropdown-item command="English">English</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="copyright">
            Copyright © 2023 Bar Management System
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('@/assets/login-bg.jpg') no-repeat center center;
    background-size: cover;
    filter: blur(3px);
    z-index: -1;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }
  }
  
  .login-form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 20px;
    
    .login-form-content {
      width: 400px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      
      .login-title {
        text-align: center;
        margin-bottom: 30px;
        
        h2 {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 10px;
        }
        
        p {
          font-size: 16px;
          color: #606266;
        }
      }
      
      .login-form {
        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .forget-pwd {
            color: #409EFF;
            text-decoration: none;
            
            &:hover {
              text-decoration: underline;
            }
          }
        }
        
        .login-button {
          width: 100%;
        }
      }
      
      .login-footer {
        margin-top: 30px;
        text-align: center;
        
        .language-switch {
          margin-bottom: 10px;
          
          .language-text {
            cursor: pointer;
            color: #606266;
            display: inline-flex;
            align-items: center;
            
            .el-icon {
              margin-right: 5px;
            }
          }
        }
        
        .copyright {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

@media screen and (max-width: 576px) {
  .login-form-container {
    .login-form-content {
      width: 100%;
      padding: 30px 20px;
    }
  }
}
</style> 
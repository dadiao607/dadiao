<template>
  <div class="profile-container">
    <div class="page-header">
      <h1 class="page-title">个人资料</h1>
    </div>
    
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <el-card shadow="hover" class="profile-card">
          <div class="avatar-container">
            <el-avatar :size="100" :src="userAvatar">
              {{ user?.name?.charAt(0) || user?.username?.charAt(0) }}
            </el-avatar>
            <h2 class="user-name">{{ user?.name || user?.username }}</h2>
            <p class="user-role">{{ userRoleText }}</p>
          </div>
          
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ stats.borrowCount }}</div>
              <div class="stat-label">借阅次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.currentBorrows }}</div>
              <div class="stat-label">当前借阅</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.favoriteCount }}</div>
              <div class="stat-label">收藏图书</div>
            </div>
          </div>
          
          <div class="account-info">
            <div class="info-item">
              <span class="label">账号:</span>
              <span class="value">{{ user?.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间:</span>
              <span class="value">{{ formatDate(user?.createTime) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧资料编辑和密码修改 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 基本资料标签页 -->
          <el-tab-pane label="基本资料" name="info">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>个人信息</span>
                  <el-button
                    type="primary"
                    link
                    @click="editMode = !editMode">
                    {{ editMode ? '取消编辑' : '编辑资料' }}
                  </el-button>
                </div>
              </template>
              
              <el-form
                ref="userFormRef"
                :model="userForm"
                :rules="userFormRules"
                label-width="100px"
                :disabled="!editMode">
                
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="userForm.name" placeholder="请输入您的姓名" />
                </el-form-item>
                
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="userForm.email" placeholder="请输入您的邮箱" />
                </el-form-item>
                
                <el-form-item label="手机号码" prop="phone">
                  <el-input v-model="userForm.phone" placeholder="请输入您的手机号码" />
                </el-form-item>
                
                <el-form-item label="性别">
                  <el-radio-group v-model="userForm.gender">
                    <el-radio label="MALE">男</el-radio>
                    <el-radio label="FEMALE">女</el-radio>
                    <el-radio label="OTHER">其他</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="生日">
                  <el-date-picker
                    v-model="userForm.birthday"
                    type="date"
                    placeholder="请选择您的生日"
                    format="YYYY-MM-DD" />
                </el-form-item>
                
                <el-form-item label="地址">
                  <el-input
                    v-model="userForm.address"
                    type="textarea"
                    placeholder="请输入您的地址"
                    rows="2" />
                </el-form-item>
                
                <el-form-item v-if="editMode">
                  <el-button
                    type="primary"
                    :loading="loading"
                    @click="saveUserInfo">
                    保存更改
                  </el-button>
                  <el-button @click="cancelEdit">取消</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <!-- 安全设置标签页 -->
          <el-tab-pane label="安全设置" name="security">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>修改密码</span>
                </div>
              </template>
              
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px">
                
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password />
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password />
                </el-form-item>
                
                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password />
                </el-form-item>
                
                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="passwordLoading"
                    @click="changePassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <!-- 借阅记录标签页 -->
          <el-tab-pane label="借阅记录" name="borrows">
            <el-card shadow="never">
              <template #header>
                <div class="card-header">
                  <span>最近借阅记录</span>
                  <el-button
                    type="primary"
                    link
                    @click="$router.push('/my-borrows')">
                    查看全部
                  </el-button>
                </div>
              </template>
              
              <div v-loading="borrowLoading">
                <el-empty v-if="recentBorrows.length === 0" description="暂无借阅记录" />
                
                <el-table v-else :data="recentBorrows" style="width: 100%">
                  <el-table-column label="图书" min-width="180">
                    <template #default="{ row }">
                      <div class="book-info-cell">
                        <img :src="row.book.imageUrl || defaultCover" class="book-cover-small" />
                        <div class="book-info-text">
                          <div class="book-title-cell">{{ row.book.title }}</div>
                          <div class="book-author">{{ row.book.author }}</div>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  
                  <el-table-column prop="borrowDate" label="借阅日期" width="120">
                    <template #default="{ row }">
                      {{ formatDate(row.borrowDate) }}
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getBorrowStatusType(row.status)">
                        {{ getBorrowStatusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button 
                        type="primary" 
                        link
                        @click="$router.push(`/books/${row.book.id}`)">
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';
import axios from 'axios';

// 获取认证状态和用户信息
const authStore = useAuthStore();
const userStore = useUserStore();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const userAvatar = ref('');
const activeTab = ref('info');
const editMode = ref(false);
const loading = ref(false);
const passwordLoading = ref(false);
const borrowLoading = ref(false);
const user = ref(null);
const recentBorrows = ref([]);
const stats = reactive({
  borrowCount: 0,
  currentBorrows: 0,
  favoriteCount: 0
});

// 表单引用
const userFormRef = ref(null);
const passwordFormRef = ref(null);

// 表单数据
const userForm = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  gender: '',
  birthday: '',
  address: ''
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单校验规则
const userFormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 密码校验规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 计算属性：用户角色文本
const userRoleText = computed(() => {
  if (!user.value) return '';
  
  switch (user.value.role) {
    case 'ADMIN': return '管理员';
    case 'USER': return '普通用户';
    default: return user.value.role;
  }
});

// 加载用户信息
const loadUserInfo = async () => {
  try {
    loading.value = true;
    
    // 获取当前用户ID
    const userId = authStore.userId;
    if (!userId) return;
    
    // 获取用户详情
    user.value = await userStore.fetchUserInfo(userId);
    
    // 填充表单数据
    Object.keys(userForm).forEach(key => {
      if (user.value[key]) {
        userForm[key] = user.value[key];
      }
    });
    
    // 获取用户头像
    if (user.value.avatarUrl) {
      userAvatar.value = user.value.avatarUrl;
    }
    
  } catch (error) {
    ElMessage.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 保存用户信息
const saveUserInfo = async () => {
  if (!userFormRef.value) return;
  
  try {
    await userFormRef.value.validate();
    
    loading.value = true;
    
    // 准备要更新的数据
    const userData = { ...userForm };
    userData.id = user.value.id;
    
    // 调用更新接口
    await userStore.updateUserInfo(userData);
    
    ElMessage.success('个人资料更新成功');
    editMode.value = false;
    
    // 重新加载用户信息
    await loadUserInfo();
  } catch (error) {
    ElMessage.error(error.message || '保存失败');
  } finally {
    loading.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  // 重置表单数据
  Object.keys(userForm).forEach(key => {
    if (user.value && user.value[key]) {
      userForm[key] = user.value[key];
    } else {
      userForm[key] = '';
    }
  });
  
  editMode.value = false;
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    
    passwordLoading.value = true;
    
    await userStore.changePassword({
      userId: user.value.id,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    
    ElMessage.success('密码修改成功');
    
    // 重置密码表单
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    // 清除验证结果
    passwordFormRef.value.resetFields();
  } catch (error) {
    ElMessage.error(error.message || '密码修改失败');
  } finally {
    passwordLoading.value = false;
  }
};

// 加载用户统计数据
const loadUserStats = async () => {
  try {
    const userId = authStore.userId;
    if (!userId) return;
    
    const response = await axios.get(`/api/users/${userId}/stats`);
    stats.borrowCount = response.data.totalBorrows || 0;
    stats.currentBorrows = response.data.currentBorrows || 0;
    stats.favoriteCount = response.data.favorites || 0;
  } catch (error) {
    console.error('Failed to load user stats', error);
  }
};

// 加载最近借阅记录
const loadRecentBorrows = async () => {
  try {
    borrowLoading.value = true;
    
    const userId = authStore.userId;
    if (!userId) return;
    
    const response = await axios.get('/api/borrows/recent', {
      params: { limit: 5 }
    });
    
    recentBorrows.value = response.data;
  } catch (error) {
    console.error('Failed to load recent borrows', error);
  } finally {
    borrowLoading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 借阅状态类型
const getBorrowStatusType = (status) => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'BORROWED': return 'primary';
    case 'RETURNED': return 'success';
    case 'OVERDUE': return 'danger';
    case 'REJECTED': return 'info';
    default: return 'info';
  }
};

// 借阅状态文本
const getBorrowStatusText = (status) => {
  switch (status) {
    case 'PENDING': return '待审批';
    case 'BORROWED': return '借阅中';
    case 'RETURNED': return '已归还';
    case 'OVERDUE': return '已逾期';
    case 'REJECTED': return '已拒绝';
    default: return status;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadUserInfo();
  loadUserStats();
  loadRecentBorrows();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}

.profile-card {
  height: 100%;
  text-align: center;
}

.avatar-container {
  padding: 20px 0;
}

.user-name {
  margin: 15px 0 5px;
  font-size: 1.5rem;
  color: #303133;
}

.user-role {
  margin: 0 0 20px;
  color: #909399;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.account-info {
  padding: 20px 10px;
  text-align: left;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.info-item .label {
  width: 80px;
  color: #909399;
}

.info-item .value {
  flex: 1;
  color: #606266;
}

.profile-tabs {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-info-cell {
  display: flex;
  align-items: center;
}

.book-cover-small {
  width: 40px;
  height: 56px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 2px;
}

.book-info-text {
  display: flex;
  flex-direction: column;
}

.book-title-cell {
  font-weight: bold;
  color: #303133;
}

.book-author {
  font-size: 12px;
  color: #909399;
}
</style> 
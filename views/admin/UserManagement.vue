<template>
  <div class="user-management-container">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon> 添加用户
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名称、邮箱或手机号"
          clearable
          class="filter-item"
          @keyup.enter="handleSearch"
          @clear="handleSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        
        <el-select
          v-model="filterRole"
          placeholder="用户角色"
          clearable
          class="filter-item"
          @change="handleSearch">
          <el-option label="管理员" value="ADMIN" />
          <el-option label="普通用户" value="USER" />
        </el-select>
        
        <el-select
          v-model="filterStatus"
          placeholder="账号状态"
          clearable
          class="filter-item"
          @change="handleSearch">
          <el-option label="正常" value="ACTIVE" />
          <el-option label="禁用" value="DISABLED" />
        </el-select>
        
        <el-select
          v-model="sortOption"
          placeholder="排序方式"
          class="filter-item"
          @change="handleSearch">
          <el-option label="注册时间 (新→旧)" value="createTimeDesc" />
          <el-option label="注册时间 (旧→新)" value="createTimeAsc" />
          <el-option label="用户名 A-Z" value="usernameAsc" />
          <el-option label="用户名 Z-A" value="usernameDesc" />
        </el-select>
      </div>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card shadow="never" class="user-table-card">
      <div v-loading="loading" class="user-table-container">
        <el-table
          :data="users"
          border
          style="width: 100%">
          <el-table-column label="用户信息" min-width="240">
            <template #default="{ row }">
              <div class="user-info-cell">
                <el-avatar :size="40" :src="row.avatarUrl">
                  {{ row.name?.charAt(0) || row.username?.charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ row.name || row.username }}</div>
                  <div class="user-username">@{{ row.username }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="联系方式" min-width="200">
            <template #default="{ row }">
              <div v-if="row.email" class="contact-item">
                <el-icon><Message /></el-icon>
                <span>{{ row.email }}</span>
              </div>
              <div v-if="row.phone" class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>{{ row.phone }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="角色" width="100">
            <template #default="{ row }">
              <el-tag
                :type="row.role === 'ADMIN' ? 'danger' : 'primary'"
                effect="plain">
                {{ row.role === 'ADMIN' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="'ACTIVE'"
                :inactive-value="'DISABLED'"
                @change="handleStatusChange(row)" />
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="注册时间" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="lastLoginTime" label="最后登录" width="170">
            <template #default="{ row }">
              {{ row.lastLoginTime ? formatDateTime(row.lastLoginTime) : '从未登录' }}
            </template>
          </el-table-column>
          
          <el-table-column label="借阅数" width="80" align="center">
            <template #default="{ row }">
              <el-link type="primary" @click="viewUserBorrows(row)">
                {{ row.borrowCount || 0 }}
              </el-link>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEditUser(row)">
                编辑
              </el-button>
              <el-button 
                type="warning" 
                size="small" 
                @click="handleResetPassword(row)">
                重置密码
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDeleteUser(row)"
                :disabled="row.role === 'ADMIN'">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalUsers"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
    
    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="isEditMode ? '编辑用户' : '添加用户'"
      width="600px">
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEditMode" />
        </el-form-item>
        
        <el-form-item v-if="!isEditMode" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="普通用户" value="READER" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" style="width: 100%">
            <el-option label="正常" value="ACTIVE" />
            <el-option label="禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="saveLoading"
            @click="saveUser">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="500px">
      <div v-if="selectedUser" class="reset-password-container">
        <p>您正在为用户 <strong>{{ selectedUser.name || selectedUser.username }}</strong> 重置密码</p>
        
        <el-form
          ref="resetPasswordFormRef"
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          label-width="100px">
          <el-form-item label="新密码" prop="newPassword">
            <el-input 
              v-model="resetPasswordForm.newPassword" 
              type="password" 
              show-password />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="resetPasswordForm.confirmPassword" 
              type="password" 
              show-password />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="saveLoading"
            @click="confirmResetPassword">
            确认重置
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 用户借阅记录对话框 -->
    <el-dialog
      v-model="userBorrowsDialogVisible"
      :title="`${selectedUser?.name || selectedUser?.username} 的借阅记录`"
      width="800px">
      <div v-loading="borrowsLoading" class="user-borrows-container">
        <el-empty v-if="!borrowsLoading && userBorrows.length === 0" description="暂无借阅记录" />
        
        <el-table v-else :data="userBorrows" border style="width: 100%">
          <el-table-column label="图书" min-width="200">
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
          
          <el-table-column prop="dueDate" label="应还日期" width="120">
            <template #default="{ row }">
              <span :class="{ 'text-danger': isOverdue(row) }">
                {{ formatDate(row.dueDate) }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="returnDate" label="归还日期" width="120">
            <template #default="{ row }">
              {{ row.returnDate ? formatDate(row.returnDate) : '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getBorrowStatusType(row.status)">
                {{ getBorrowStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Message, Phone } from '@element-plus/icons-vue';
import axios from 'axios';

const userStore = useUserStore();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(false);
const saveLoading = ref(false);
const borrowsLoading = ref(false);
const users = ref([]);
const userBorrows = ref([]);
const totalUsers = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const filterRole = ref('');
const filterStatus = ref('');
const sortOption = ref('createTimeDesc');
const userDialogVisible = ref(false);
const resetPasswordDialogVisible = ref(false);
const userBorrowsDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedUser = ref(null);

// 表单引用
const userFormRef = ref(null);
const resetPasswordFormRef = ref(null);

// 用户表单数据
const userForm = reactive({
  id: '',
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  role: 'USER',
  status: 'ACTIVE'
});

// 重置密码表单
const resetPasswordForm = reactive({
  userId: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单校验规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ]
};

// 重置密码表单校验规则
const resetPasswordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      query: searchQuery.value,
      role: filterRole.value,
      status: filterStatus.value,
      sort: sortOption.value
    };
    
    const response = await userStore.fetchUsers(params);
    users.value = response.content;
    totalUsers.value = response.totalElements;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

// 处理页面大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadUsers();
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadUsers();
};

// 处理添加用户
const handleAddUser = () => {
  resetUserForm();
  isEditMode.value = false;
  userDialogVisible.value = true;
};

// 处理编辑用户
const handleEditUser = (user) => {
  resetUserForm();
  isEditMode.value = true;
  
  // 填充表单数据
  Object.keys(userForm).forEach(key => {
    if (key !== 'password' && user[key] !== undefined) {
      userForm[key] = user[key];
    }
  });
  
  userDialogVisible.value = true;
};

// 处理用户状态变更
const handleStatusChange = async (user) => {
  try {
    await userStore.updateUserInfo({
      id: user.id,
      status: user.status
    });
    
    ElMessage.success(`用户状态已${user.status === 'ACTIVE' ? '启用' : '禁用'}`);
  } catch (error) {
    ElMessage.error(error.message || '更新用户状态失败');
    // 回滚状态
    user.status = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  }
};

// 处理重置密码
const handleResetPassword = (user) => {
  selectedUser.value = user;
  resetPasswordForm.userId = user.id;
  resetPasswordForm.newPassword = '';
  resetPasswordForm.confirmPassword = '';
  
  resetPasswordDialogVisible.value = true;
};

// 确认重置密码
const confirmResetPassword = async () => {
  if (!resetPasswordFormRef.value) return;
  
  try {
    await resetPasswordFormRef.value.validate();
    
    saveLoading.value = true;
    
    await userStore.resetPassword({
      userId: resetPasswordForm.userId,
      newPassword: resetPasswordForm.newPassword
    });
    
    ElMessage.success('密码重置成功');
    resetPasswordDialogVisible.value = false;
  } catch (error) {
    ElMessage.error(error.message || '重置密码失败');
  } finally {
    saveLoading.value = false;
  }
};

// 处理删除用户
const handleDeleteUser = async (user) => {
  if (user.role === 'ADMIN') {
    ElMessage.warning('不能删除管理员账户');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.name || user.username}"吗？此操作不可逆`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    await userStore.deleteUser(user.id);
    ElMessage.success('用户删除成功');
    
    // 刷新用户列表
    loadUsers();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除用户失败');
    }
  } finally {
    loading.value = false;
  }
};

// 查看用户借阅记录
const viewUserBorrows = async (user) => {
  try {
    selectedUser.value = user;
    userBorrowsDialogVisible.value = true;
    borrowsLoading.value = true;
    
    const response = await axios.get(`/api/users/${user.id}/borrows`);
    userBorrows.value = response.data;
  } catch (error) {
    ElMessage.error('获取用户借阅记录失败');
    console.error(error);
  } finally {
    borrowsLoading.value = false;
  }
};

// 保存用户
const saveUser = async () => {
  if (!userFormRef.value) return;
  
  try {
    await userFormRef.value.validate();
    
    saveLoading.value = true;
    
    if (isEditMode.value) {
      // 更新用户
      await userStore.updateUserInfo(userForm);
      ElMessage.success('用户信息更新成功');
    } else {
      // 创建用户
      await userStore.createUser(userForm);
      ElMessage.success('用户创建成功');
    }
    
    userDialogVisible.value = false;
    
    // 刷新用户列表
    loadUsers();
  } catch (error) {
    ElMessage.error(error.message || '保存用户失败');
  } finally {
    saveLoading.value = false;
  }
};

// 重置用户表单
const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
  
  userForm.id = '';
  userForm.username = '';
  userForm.password = '';
  userForm.name = '';
  userForm.email = '';
  userForm.phone = '';
  userForm.role = 'USER';
  userForm.status = 'ACTIVE';
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('zh-CN');
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
};

// 判断是否逾期
const isOverdue = (borrow) => {
  if (borrow.status === 'RETURNED') return false;
  if (!borrow.dueDate) return false;
  
  const today = new Date();
  const dueDate = new Date(borrow.dueDate);
  return today > dueDate;
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
  loadUsers();
});
</script>

<style scoped>
.user-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-item {
  width: 250px;
}

.user-table-card {
  margin-bottom: 20px;
}

.user-info-cell {
  display: flex;
  align-items: center;
}

.user-details {
  margin-left: 10px;
}

.user-name {
  font-weight: bold;
  color: #303133;
}

.user-username {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 13px;
  color: #606266;
}

.contact-item .el-icon {
  margin-right: 5px;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reset-password-container {
  padding: 0 20px;
}

.user-borrows-container {
  max-height: 500px;
  overflow-y: auto;
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

.text-danger {
  color: #F56C6C;
}

@media (max-width: 768px) {
  .filter-item {
    width: 100%;
  }
}
</style> 
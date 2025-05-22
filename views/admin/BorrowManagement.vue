<template>
  <div class="borrow-management-container">
    <div class="page-header">
      <h1 class="page-title">借阅管理</h1>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图书或用户"
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
          v-model="filterStatus"
          placeholder="借阅状态"
          clearable
          class="filter-item"
          @change="handleSearch">
          <el-option label="待审批" value="PENDING" />
          <el-option label="借阅中" value="BORROWED" />
          <el-option label="已归还" value="RETURNED" />
          <el-option label="已逾期" value="OVERDUE" />
          <el-option label="已拒绝" value="REJECTED" />
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="filter-item"
          @change="handleSearch" />
        
        <el-select
          v-model="sortOption"
          placeholder="排序方式"
          class="filter-item"
          @change="handleSearch">
          <el-option label="申请时间 (新→旧)" value="createTimeDesc" />
          <el-option label="申请时间 (旧→新)" value="createTimeAsc" />
          <el-option label="到期时间 (近→远)" value="dueDateAsc" />
          <el-option label="到期时间 (远→近)" value="dueDateDesc" />
        </el-select>
      </div>
    </el-card>
    
    <!-- 借阅列表 -->
    <el-card shadow="never" class="borrow-table-card">
      <div class="pending-statistics" v-if="hasPendingBorrows">
        <el-alert
          title="待处理的借阅申请"
          type="warning"
          :closable="false"
          show-icon>
          <template #default>
            当前有 <strong>{{ pendingCount }}</strong> 个借阅申请等待处理。
            <el-link type="warning" @click="filterByPending">立即处理</el-link>
          </template>
        </el-alert>
      </div>
      
      <div v-loading="loading" class="borrow-table-container">
        <el-table
          :data="borrows"
          border
          style="width: 100%">
          <el-table-column label="图书信息" min-width="200">
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
          
          <el-table-column label="读者" min-width="150">
            <template #default="{ row }">
              <div class="user-info-cell">
                <el-avatar :size="30" :src="row.user.avatarUrl">
                  {{ row.user.name?.charAt(0) || row.user.username?.charAt(0) }}
                </el-avatar>
                <div class="user-info-text">
                  <span class="user-name">{{ row.user.name || row.user.username }}</span>
                  <span class="user-username">@{{ row.user.username }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="applyTime" label="申请时间" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.applyTime) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="borrowDate" label="借阅日期" width="110">
            <template #default="{ row }">
              {{ row.borrowDate ? formatDate(row.borrowDate) : '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="dueDate" label="应还日期" width="110">
            <template #default="{ row }">
              <span :class="{ 'text-danger': isOverdue(row) }">
                {{ row.dueDate ? formatDate(row.dueDate) : '-' }}
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="returnDate" label="归还日期" width="110">
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
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <!-- 待审批状态的操作按钮 -->
              <template v-if="row.status === 'PENDING'">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="approveBorrow(row)">
                  批准
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="rejectBorrow(row)">
                  拒绝
                </el-button>
              </template>
              
              <!-- 借阅中状态的操作按钮 -->
              <template v-else-if="row.status === 'BORROWED' || row.status === 'OVERDUE'">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleReturn(row)">
                  归还
                </el-button>
                <el-button 
                  type="warning" 
                  size="small" 
                  @click="renewBorrow(row)"
                  :disabled="row.renewCount >= maxRenewals">
                  续借
                </el-button>
              </template>
              
              <!-- 其他状态显示详情按钮 -->
              <template v-else>
                <el-button 
                  type="info" 
                  size="small" 
                  @click="viewBorrowDetail(row)">
                  详情
                </el-button>
              </template>
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
            :total="totalBorrows"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
    
    <!-- 借阅详情对话框 -->
    <el-dialog
      v-model="borrowDetailDialogVisible"
      title="借阅详情"
      width="600px">
      <div v-if="selectedBorrow" class="borrow-detail-container">
        <div class="borrow-detail-book">
          <img :src="selectedBorrow.book.imageUrl || defaultCover" class="book-cover-medium" />
          <div class="book-detail-info">
            <h3>{{ selectedBorrow.book.title }}</h3>
            <p>{{ selectedBorrow.book.author }}</p>
            <p>ISBN: {{ selectedBorrow.book.isbn }}</p>
          </div>
        </div>
        
        <el-divider />
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="借阅状态">
            <el-tag :type="getBorrowStatusType(selectedBorrow.status)">
              {{ getBorrowStatusText(selectedBorrow.status) }}
            </el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="读者">
            {{ selectedBorrow.user.name || selectedBorrow.user.username }}
          </el-descriptions-item>
          
          <el-descriptions-item label="申请时间">
            {{ formatDateTime(selectedBorrow.applyTime) }}
          </el-descriptions-item>
          
          <el-descriptions-item label="处理人">
            {{ selectedBorrow.handler ? selectedBorrow.handler.name || selectedBorrow.handler.username : '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="借阅日期">
            {{ selectedBorrow.borrowDate ? formatDate(selectedBorrow.borrowDate) : '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="应还日期">
            {{ selectedBorrow.dueDate ? formatDate(selectedBorrow.dueDate) : '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="归还日期">
            {{ selectedBorrow.returnDate ? formatDate(selectedBorrow.returnDate) : '-' }}
          </el-descriptions-item>
          
          <el-descriptions-item label="续借次数">
            {{ selectedBorrow.renewCount || 0 }}
          </el-descriptions-item>
          
          <el-descriptions-item label="备注" :span="2">
            {{ selectedBorrow.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedBorrow.operationLogs && selectedBorrow.operationLogs.length > 0" class="operation-logs">
          <h4>操作记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="log in selectedBorrow.operationLogs"
              :key="log.id"
              :timestamp="formatDateTime(log.operationTime)"
              :type="getOperationLogType(log.operation)">
              <p class="operation-text">{{ log.operation }}</p>
              <p class="operator-text">操作人: {{ log.operator.name || log.operator.username }}</p>
              <p v-if="log.remark" class="remark-text">备注: {{ log.remark }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
    
    <!-- 归还确认对话框 -->
    <el-dialog
      v-model="returnDialogVisible"
      title="图书归还"
      width="500px">
      <div v-if="selectedBorrow" class="return-container">
        <p>确认归还以下图书？</p>
        <div class="return-book-info">
          <div class="book-title">《{{ selectedBorrow.book.title }}》</div>
          <div class="book-meta">借阅人: {{ selectedBorrow.user.name || selectedBorrow.user.username }}</div>
          <div class="book-meta">应还日期: {{ formatDate(selectedBorrow.dueDate) }}</div>
        </div>
        
        <el-form :model="returnForm">
          <el-form-item label="归还状态">
            <el-radio-group v-model="returnForm.condition">
              <el-radio :label="'GOOD'">完好</el-radio>
              <el-radio :label="'DAMAGED'">轻微损坏</el-radio>
              <el-radio :label="'SEVERE'">严重损坏</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input v-model="returnForm.remark" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="returnDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="saveLoading"
            @click="confirmReturn">
            确认归还
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 续借确认对话框 -->
    <el-dialog
      v-model="renewDialogVisible"
      title="续借申请"
      width="500px">
      <div v-if="selectedBorrow" class="renew-container">
        <p>确认为以下图书续借？</p>
        <div class="renew-book-info">
          <div class="book-title">《{{ selectedBorrow.book.title }}》</div>
          <div class="book-meta">借阅人: {{ selectedBorrow.user.name || selectedBorrow.user.username }}</div>
          <div class="book-meta">当前到期日: {{ formatDate(selectedBorrow.dueDate) }}</div>
          <div class="book-meta">续借后到期日: {{ formatDate(getNewDueDate(selectedBorrow.dueDate)) }}</div>
          <div class="book-meta">已续借次数: {{ selectedBorrow.renewCount || 0 }}/{{ maxRenewals }}</div>
        </div>
        
        <el-form :model="renewForm">
          <el-form-item label="备注">
            <el-input v-model="renewForm.remark" type="textarea" rows="3" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renewDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="saveLoading"
            @click="confirmRenew">
            确认续借
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(false);
const saveLoading = ref(false);
const borrows = ref([]);
const totalBorrows = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const filterStatus = ref('');
const dateRange = ref([]);
const sortOption = ref('applyTimeDesc');
const borrowDetailDialogVisible = ref(false);
const returnDialogVisible = ref(false);
const renewDialogVisible = ref(false);
const selectedBorrow = ref(null);

// 续借最大次数
const maxRenewals = 2;

// 归还表单
const returnForm = reactive({
  borrowId: '',
  condition: 'GOOD',
  remark: ''
});

// 续借表单
const renewForm = reactive({
  borrowId: '',
  remark: ''
});

// 计算待处理借阅申请
const pendingCount = ref(0);
const hasPendingBorrows = computed(() => pendingCount.value > 0);

// 检查URL参数中是否有filter=pending
watch(() => route.query, (query) => {
  if (query.filter === 'pending') {
    filterStatus.value = 'PENDING';
  }
}, { immediate: true });

// 加载借阅列表
const loadBorrows = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      query: searchQuery.value,
      status: filterStatus.value,
      startDate: dateRange.value && dateRange.value[0] ? dateRange.value[0] : null,
      endDate: dateRange.value && dateRange.value[1] ? dateRange.value[1] : null,
      sort: sortOption.value
    };
    
    const response = await axios.get('/api/admin/borrows', { params });
    borrows.value = response.data.content;
    totalBorrows.value = response.data.totalElements;
    
    // 更新待处理数量
    loadPendingCount();
  } catch (error) {
    ElMessage.error('获取借阅列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 加载待处理借阅数量
const loadPendingCount = async () => {
  try {
    const response = await axios.get('/api/admin/borrows/count/pending');
    pendingCount.value = response.data;
  } catch (error) {
    console.error('获取待处理借阅数量失败', error);
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadBorrows();
};

// 处理页面大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadBorrows();
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadBorrows();
};

// 筛选待处理借阅
const filterByPending = () => {
  filterStatus.value = 'PENDING';
  currentPage.value = 1;
  loadBorrows();
};

// 查看借阅详情
const viewBorrowDetail = async (borrow) => {
  try {
    const response = await axios.get(`/api/admin/borrows/${borrow.id}`);
    selectedBorrow.value = response.data;
    borrowDetailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取借阅详情失败');
    console.error(error);
  }
};

// 批准借阅
const approveBorrow = async (borrow) => {
  try {
    await ElMessageBox.confirm(
      `确定批准用户 ${borrow.user.name || borrow.user.username} 借阅《${borrow.book.title}》吗？`,
      '确认批准',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    loading.value = true;
    
    await axios.post(`/api/admin/borrows/${borrow.id}/approve`);
    
    ElMessage.success('借阅已批准');
    loadBorrows();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批准借阅失败');
      console.error(error);
    }
  } finally {
    loading.value = false;
  }
};

// 拒绝借阅
const rejectBorrow = async (borrow) => {
  try {
    const { value: remark } = await ElMessageBox.prompt(
      `请输入拒绝原因`,
      '拒绝借阅',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入拒绝原因（可选）'
      }
    );
    
    loading.value = true;
    
    await axios.post(`/api/admin/borrows/${borrow.id}/reject`, { remark });
    
    ElMessage.success('已拒绝借阅申请');
    loadBorrows();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('拒绝借阅失败');
      console.error(error);
    }
  } finally {
    loading.value = false;
  }
};

// 处理归还
const handleReturn = (borrow) => {
  selectedBorrow.value = borrow;
  returnForm.borrowId = borrow.id;
  returnForm.condition = 'GOOD';
  returnForm.remark = '';
  
  returnDialogVisible.value = true;
};

// 确认归还
const confirmReturn = async () => {
  try {
    saveLoading.value = true;
    
    await axios.post(`/api/admin/borrows/${returnForm.borrowId}/return`, {
      condition: returnForm.condition,
      remark: returnForm.remark
    });
    
    ElMessage.success('图书归还成功');
    returnDialogVisible.value = false;
    loadBorrows();
  } catch (error) {
    ElMessage.error('图书归还失败');
    console.error(error);
  } finally {
    saveLoading.value = false;
  }
};

// 续借处理
const renewBorrow = (borrow) => {
  if (borrow.renewCount >= maxRenewals) {
    ElMessage.warning(`该图书已达到最大续借次数(${maxRenewals}次)`);
    return;
  }
  
  selectedBorrow.value = borrow;
  renewForm.borrowId = borrow.id;
  renewForm.remark = '';
  
  renewDialogVisible.value = true;
};

// 确认续借
const confirmRenew = async () => {
  try {
    saveLoading.value = true;
    
    await axios.post(`/api/admin/borrows/${renewForm.borrowId}/renew`, {
      remark: renewForm.remark
    });
    
    ElMessage.success('图书续借成功');
    renewDialogVisible.value = false;
    loadBorrows();
  } catch (error) {
    ElMessage.error('图书续借失败');
    console.error(error);
  } finally {
    saveLoading.value = false;
  }
};

// 计算新的到期日期
const getNewDueDate = (currentDueDate) => {
  if (!currentDueDate) return '';
  
  const dueDate = new Date(currentDueDate);
  // 默认续借30天
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate.toISOString().split('T')[0];
};

// 判断是否逾期
const isOverdue = (borrow) => {
  if (borrow.status === 'RETURNED' || borrow.status === 'REJECTED') return false;
  if (!borrow.dueDate) return false;
  
  const today = new Date();
  const dueDate = new Date(borrow.dueDate);
  return today > dueDate;
};

// 获取操作日志类型
const getOperationLogType = (operation) => {
  if (operation.includes('批准')) return 'success';
  if (operation.includes('拒绝')) return 'danger';
  if (operation.includes('归还')) return 'info';
  if (operation.includes('续借')) return 'warning';
  return 'primary';
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

// 组件挂载时加载数据
onMounted(() => {
  loadBorrows();
});
</script>

<style scoped>
.borrow-management-container {
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
  width: 220px;
}

.borrow-table-card {
  margin-bottom: 20px;
}

.pending-statistics {
  margin-bottom: 20px;
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

.user-info-cell {
  display: flex;
  align-items: center;
}

.user-info-text {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  color: #303133;
}

.user-username {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-danger {
  color: #F56C6C;
}

/* 借阅详情 */
.borrow-detail-container {
  padding: 0 10px;
}

.borrow-detail-book {
  display: flex;
  margin-bottom: 20px;
}

.book-cover-medium {
  width: 90px;
  height: 125px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 20px;
}

.book-detail-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.book-detail-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.book-detail-info p {
  margin: 5px 0;
  color: #606266;
}

.operation-logs {
  margin-top: 20px;
}

.operation-logs h4 {
  margin-bottom: 15px;
  color: #303133;
}

.operation-text {
  margin: 0;
  font-weight: bold;
}

.operator-text {
  margin: 5px 0;
  font-size: 13px;
  color: #606266;
}

.remark-text {
  margin: 5px 0;
  font-size: 13px;
  color: #909399;
  white-space: pre-wrap;
}

/* 归还和续借表单 */
.return-container,
.renew-container {
  padding: 0 20px;
}

.return-book-info,
.renew-book-info {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.book-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.book-meta {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .filter-item {
    width: 100%;
  }
  
  .user-info-cell {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-info-text {
    margin-left: 0;
    margin-top: 5px;
  }
}
</style> 
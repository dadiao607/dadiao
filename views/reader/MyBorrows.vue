<template>
  <div class="my-borrows-container">
    <h1 class="page-title">我的借阅</h1>
    
    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="borrow-tabs">
      <el-tab-pane label="当前借阅" name="current">
        <div v-loading="loading">
          <el-empty v-if="currentBorrows.length === 0" description="暂无当前借阅记录" />
          
          <el-table v-else :data="currentBorrows" style="width: 100%" border>
            <el-table-column label="图书信息" min-width="250">
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
            
            <el-table-column prop="borrowDate" label="借阅日期" width="130">
              <template #default="{ row }">
                {{ formatDate(row.borrowDate) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="dueDate" label="应还日期" width="130">
              <template #default="{ row }">
                <span :class="{ 'text-danger': isOverdue(row.dueDate) }">
                  {{ formatDate(row.dueDate) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getBorrowStatusType(row.status)">
                  {{ getBorrowStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status === 'BORROWED'"
                  type="primary" 
                  size="small" 
                  plain
                  @click="handleRenew(row)">
                  续借
                </el-button>
                <el-button 
                  v-if="row.status === 'BORROWED'"
                  type="success" 
                  size="small" 
                  plain
                  @click="handleReturn(row)">
                  归还
                </el-button>
                <el-button 
                  type="info" 
                  size="small" 
                  plain
                  @click="goToBookDetail(row.book.id)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container" v-if="currentBorrows.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :small="false"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalItems"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="借阅历史" name="history">
        <div v-loading="loading">
          <el-empty v-if="historyBorrows.length === 0" description="暂无历史借阅记录" />
          
          <el-table v-else :data="historyBorrows" style="width: 100%" border>
            <el-table-column label="图书信息" min-width="250">
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
            
            <el-table-column prop="borrowDate" label="借阅日期" width="130">
              <template #default="{ row }">
                {{ formatDate(row.borrowDate) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="returnDate" label="归还日期" width="130">
              <template #default="{ row }">
                {{ formatDate(row.returnDate) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getBorrowStatusType(row.status)">
                  {{ getBorrowStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="overdueDays" label="逾期天数" width="100">
              <template #default="{ row }">
                <span v-if="row.overdueDays > 0" class="text-danger">
                  {{ row.overdueDays }} 天
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="info" 
                  size="small" 
                  plain
                  @click="goToBookDetail(row.book.id)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container" v-if="historyBorrows.length > 0">
            <el-pagination
              v-model:current-page="historyPage"
              v-model:page-size="historyPageSize"
              :page-sizes="[10, 20, 50]"
              :small="false"
              layout="total, sizes, prev, pager, next, jumper"
              :total="historyTotalItems"
              @size-change="handleHistorySizeChange"
              @current-change="handleHistoryPageChange" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 续借对话框 -->
    <el-dialog
      v-model="renewDialogVisible"
      title="续借确认"
      width="400px">
      <div v-if="selectedBorrow" class="renew-confirmation">
        <p>您确定要续借《{{ selectedBorrow.book.title }}》吗？</p>
        <div class="borrow-rules">
          <h4>续借规则：</h4>
          <ul>
            <li>每本书最多可续借1次</li>
            <li>续借后借阅期将延长15天</li>
            <li>已逾期或已达到续借上限的图书不可续借</li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="renewDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="actionLoading"
            @click="confirmRenew">
            确认续借
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 归还对话框 -->
    <el-dialog
      v-model="returnDialogVisible"
      title="归还确认"
      width="400px">
      <div v-if="selectedBorrow" class="return-confirmation">
        <p>您确定要归还《{{ selectedBorrow.book.title }}》吗？</p>
        <p v-if="isOverdue(selectedBorrow.dueDate)" class="overdue-notice">
          注意：该图书已逾期 {{ getDaysOverdue(selectedBorrow.dueDate) }} 天，
          可能产生罚款。
        </p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="returnDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="actionLoading"
            @click="confirmReturn">
            确认归还
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const router = useRouter();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(false);
const activeTab = ref('current');
const currentBorrows = ref([]);
const historyBorrows = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const historyPage = ref(1);
const historyPageSize = ref(10);
const historyTotalItems = ref(0);
const renewDialogVisible = ref(false);
const returnDialogVisible = ref(false);
const actionLoading = ref(false);
const selectedBorrow = ref(null);

// 加载当前借阅
const loadCurrentBorrows = async () => {
  try {
    loading.value = true;
    
    const response = await axios.get('/api/borrows/current', {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value
      }
    });
    
    currentBorrows.value = response.data.content;
    totalItems.value = response.data.totalElements;
  } catch (error) {
    ElMessage.error('获取当前借阅记录失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 加载历史借阅
const loadHistoryBorrows = async () => {
  try {
    loading.value = true;
    
    const response = await axios.get('/api/borrows/history', {
      params: {
        page: historyPage.value - 1,
        size: historyPageSize.value
      }
    });
    
    historyBorrows.value = response.data.content;
    historyTotalItems.value = response.data.totalElements;
  } catch (error) {
    ElMessage.error('获取历史借阅记录失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理续借
const handleRenew = (borrow) => {
  selectedBorrow.value = borrow;
  renewDialogVisible.value = true;
};

// 确认续借
const confirmRenew = async () => {
  if (!selectedBorrow.value) return;
  
  try {
    actionLoading.value = true;
    
    await axios.post(`/api/borrows/${selectedBorrow.value.id}/renew`);
    
    ElMessage.success('续借成功');
    renewDialogVisible.value = false;
    
    // 刷新当前借阅列表
    await loadCurrentBorrows();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '续借失败');
  } finally {
    actionLoading.value = false;
  }
};

// 处理归还
const handleReturn = (borrow) => {
  selectedBorrow.value = borrow;
  returnDialogVisible.value = true;
};

// 确认归还
const confirmReturn = async () => {
  if (!selectedBorrow.value) return;
  
  try {
    actionLoading.value = true;
    
    await axios.post(`/api/borrows/${selectedBorrow.value.id}/return`);
    
    ElMessage.success('归还申请已提交，请等待管理员确认');
    returnDialogVisible.value = false;
    
    // 刷新当前借阅列表
    await loadCurrentBorrows();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '归还申请失败');
  } finally {
    actionLoading.value = false;
  }
};

// 跳转到图书详情
const goToBookDetail = (bookId) => {
  router.push(`/books/${bookId}`);
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadCurrentBorrows();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadCurrentBorrows();
};

// 处理历史页码变化
const handleHistoryPageChange = (page) => {
  historyPage.value = page;
  loadHistoryBorrows();
};

// 处理历史每页数量变化
const handleHistorySizeChange = (size) => {
  historyPageSize.value = size;
  historyPage.value = 1;
  loadHistoryBorrows();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 判断是否逾期
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return today > due;
};

// 获取逾期天数
const getDaysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

// 在组件挂载时加载数据
onMounted(() => {
  loadCurrentBorrows();
});
</script>

<style scoped>
.my-borrows-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 1.8rem;
  color: #303133;
}

.borrow-tabs {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.book-info-cell {
  display: flex;
  align-items: center;
}

.book-cover-small {
  width: 50px;
  height: 70px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.book-info-text {
  display: flex;
  flex-direction: column;
}

.book-title-cell {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
}

.book-author {
  font-size: 12px;
  color: #606266;
}

.text-danger {
  color: #F56C6C;
}

.renew-confirmation,
.return-confirmation {
  text-align: center;
}

.borrow-rules {
  text-align: left;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.borrow-rules h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.borrow-rules ul {
  margin: 0;
  padding-left: 20px;
}

.overdue-notice {
  color: #F56C6C;
  margin-top: 15px;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
}
</style> 
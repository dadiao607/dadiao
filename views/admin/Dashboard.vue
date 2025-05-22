<template>
  <div class="dashboard-container">
    <h1 class="page-title">管理员控制台</h1>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon users-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">注册用户</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>今日新增: <strong>{{ stats.newUsers }}</strong></span>
            <el-button type="primary" link @click="$router.push('/admin/users')">
              用户管理 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon books-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBooks }}</div>
              <div class="stat-label">馆藏图书</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>可借阅: <strong>{{ stats.availableBooks }}</strong></span>
            <el-button type="primary" link @click="$router.push('/admin/books')">
              图书管理 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon borrows-icon">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.activeBorrows }}</div>
              <div class="stat-label">当前借阅</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>逾期: <strong>{{ stats.overdueBorrows }}</strong></span>
            <el-button type="primary" link @click="$router.push('/admin/borrows')">
              借阅管理 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon requests-icon">
              <el-icon><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingRequests }}</div>
              <div class="stat-label">待处理请求</div>
            </div>
          </div>
          <div class="stat-footer">
            <span>借阅申请: <strong>{{ stats.borrowRequests }}</strong></span>
            <el-button type="primary" link @click="handlePendingRequests">
              立即处理 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表和活动区域 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 借阅趋势图表 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>借阅趋势</span>
              <div class="chart-filter">
                <el-radio-group v-model="timeRange" size="small" @change="loadBorrowTrend">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div v-loading="chartLoading" class="chart-container">
            <div v-if="!chartLoading && borrowTrend.length === 0" class="no-data">暂无数据</div>
            <div ref="borrowChartRef" class="borrow-chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统活动日志 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="activity-card">
          <template #header>
            <div class="card-header">
              <span>系统活动</span>
              <el-button type="primary" link @click="loadActivities">
                刷新
              </el-button>
            </div>
          </template>
          
          <div v-loading="activityLoading" class="activity-list">
            <el-empty v-if="!activityLoading && activities.length === 0" description="暂无活动" />
            
            <el-timeline v-else>
              <el-timeline-item
                v-for="activity in activities"
                :key="activity.id"
                :timestamp="formatTime(activity.createTime)"
                :type="getActivityType(activity.type)">
                <div class="activity-content">
                  <span class="activity-title">{{ activity.title }}</span>
                  <p class="activity-details">{{ activity.content }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近处理的借阅 -->
    <el-card shadow="hover" class="recent-borrows-card">
      <template #header>
        <div class="card-header">
          <span>最近处理的借阅</span>
          <el-button type="primary" link @click="$router.push('/admin/borrows')">
            查看全部
          </el-button>
        </div>
      </template>
      
      <div v-loading="borrowsLoading">
        <el-empty v-if="!borrowsLoading && recentBorrows.length === 0" description="暂无记录" />
        
        <el-table v-else :data="recentBorrows" style="width: 100%">
          <el-table-column label="读者" width="180">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="row.user.avatarUrl">
                  {{ row.user.name?.charAt(0) || row.user.username?.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ row.user.name || row.user.username }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="图书" min-width="200">
            <template #default="{ row }">
              <div class="book-info">
                <span class="book-title">{{ row.book.title }}</span>
                <span class="book-author">{{ row.book.author }}</span>
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
              {{ formatDate(row.dueDate) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getBorrowStatusType(row.status)">
                {{ getBorrowStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="handler" label="处理人" width="120">
            <template #default="{ row }">
              {{ row.handler ? row.handler.name || row.handler.username : '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="handleTime" label="处理时间" width="170">
            <template #default="{ row }">
              {{ row.handleTime ? formatDateTime(row.handleTime) : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { User, Reading, Tickets, Message, ArrowRight } from '@element-plus/icons-vue';

const router = useRouter();

// 图表引用
const borrowChartRef = ref(null);
let borrowChart = null;
let echarts = null; // 声明echarts变量

// 状态变量
const timeRange = ref('week');
const chartLoading = ref(false);
const activityLoading = ref(false);
const borrowsLoading = ref(false);
const borrowTrend = ref([]);
const activities = ref([]);
const recentBorrows = ref([]);

// 统计数据
const stats = reactive({
  totalUsers: 0,
  newUsers: 0,
  totalBooks: 0,
  availableBooks: 0,
  activeBorrows: 0,
  overdueBorrows: 0,
  pendingRequests: 0,
  borrowRequests: 0
});

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await axios.get('/api/admin/stats/dashboard');
    Object.assign(stats, response.data);
  } catch (error) {
    ElMessage.error('获取统计数据失败');
    console.error(error);
  }
};

// 加载借阅趋势数据
const loadBorrowTrend = async () => {
  try {
    chartLoading.value = true;
    
    const response = await axios.get('/api/admin/stats/borrow-trend', {
      params: { range: timeRange.value }
    });
    
    borrowTrend.value = response.data;
    renderBorrowChart();
  } catch (error) {
    ElMessage.error('获取借阅趋势数据失败');
    console.error(error);
  } finally {
    chartLoading.value = false;
  }
};

// 渲染借阅趋势图表
const renderBorrowChart = () => {
  if (!borrowChartRef.value || !echarts) return;
  
  // 如果图表已经初始化，销毁它
  if (borrowChart) {
    borrowChart.dispose();
  }
  
  // 初始化图表
  borrowChart = echarts.init(borrowChartRef.value);
  
  // 准备数据
  const dates = borrowTrend.value.map(item => item.date);
  const borrowData = borrowTrend.value.map(item => item.borrowCount);
  const returnData = borrowTrend.value.map(item => item.returnCount);
  
  // 设置图表选项
  const option = {
    title: {
      text: '图书借阅与归还趋势',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['借阅', '归还'],
      top: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '借阅',
        type: 'line',
        data: borrowData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        }
      },
      {
        name: '归还',
        type: 'line',
        data: returnData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          width: 3
        }
      }
    ]
  };
  
  // 渲染图表
  borrowChart.setOption(option);
  
  // 设置图表响应式
  window.addEventListener('resize', () => {
    borrowChart.resize();
  });
};

// 加载系统活动
const loadActivities = async () => {
  try {
    activityLoading.value = true;
    
    const response = await axios.get('/api/admin/activities', {
      params: { limit: 10 }
    });
    
    activities.value = response.data;
  } catch (error) {
    ElMessage.error('获取系统活动失败');
    console.error(error);
  } finally {
    activityLoading.value = false;
  }
};

// 加载最近处理的借阅
const loadRecentBorrows = async () => {
  try {
    borrowsLoading.value = true;
    
    const response = await axios.get('/api/admin/borrows/recent', {
      params: { limit: 10 }
    });
    
    recentBorrows.value = response.data;
  } catch (error) {
    ElMessage.error('获取最近借阅记录失败');
    console.error(error);
  } finally {
    borrowsLoading.value = false;
  }
};

// 处理待处理请求按钮点击
const handlePendingRequests = () => {
  if (stats.borrowRequests > 0) {
    router.push('/admin/borrows?filter=pending');
  } else {
    router.push('/admin/borrows');
  }
};

// 获取活动类型样式
const getActivityType = (type) => {
  switch (type) {
    case 'USER_REGISTER': return 'primary';
    case 'BOOK_ADD': return 'success';
    case 'BORROW_REQUEST': return 'warning';
    case 'BOOK_RETURN': return 'info';
    case 'USER_LOGIN': return '';
    case 'SYSTEM': return 'danger';
    default: return '';
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

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return formatDate(dateString);
  }
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
onMounted(async () => {
  // 动态导入echarts
  try {
    // 添加CDN链接到页面
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
    script.async = true;
    
    script.onload = () => {
      // CDN加载成功后，获取echarts全局对象
      echarts = window.echarts;
      // 加载数据并渲染图表
      loadStats();
      loadBorrowTrend();
      loadActivities();
      loadRecentBorrows();
    };
    
    script.onerror = () => {
      ElMessage.error('加载图表库失败');
      // 即使没有图表，也加载其他数据
      loadStats();
      loadActivities();
      loadRecentBorrows();
    };
    
    document.head.appendChild(script);
  } catch (error) {
    ElMessage.error('初始化图表失败');
    console.error(error);
    // 加载其他数据
    loadStats();
    loadActivities();
    loadRecentBorrows();
  }
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.8rem;
  color: #303133;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  overflow: hidden;
}

.stat-card-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 15px;
  font-size: 32px;
  color: white;
}

.users-icon {
  background-color: #409EFF;
}

.books-icon {
  background-color: #67C23A;
}

.borrows-icon {
  background-color: #E6A23C;
}

.requests-icon {
  background-color: #F56C6C;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 0;
  margin-top: 10px;
  border-top: 1px solid #EBEEF5;
  font-size: 13px;
  color: #909399;
}

.chart-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
  position: relative;
}

.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
}

.borrow-chart {
  width: 100%;
  height: 100%;
}

.activity-card {
  height: 100%;
}

.activity-list {
  max-height: 350px;
  overflow-y: auto;
}

.activity-content {
  padding: 0 0 15px 0;
}

.activity-title {
  font-weight: bold;
  color: #303133;
}

.activity-details {
  margin: 5px 0 0 0;
  color: #606266;
  font-size: 13px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  margin-left: 10px;
}

.book-info {
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: bold;
  color: #303133;
}

.book-author {
  font-size: 13px;
  color: #909399;
  margin-top: 3px;
}

@media (max-width: 768px) {
  .stat-cards {
    margin-bottom: 10px;
  }
  
  .stat-card {
    margin-bottom: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style> 
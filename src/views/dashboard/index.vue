<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'

// 统计卡片数据
const statsCards = reactive([
  { title: '今日订单', value: 128, icon: 'ShoppingCart', color: '#409EFF', increase: '12%' },
  { title: '营业额(元)', value: 15680, icon: 'Money', color: '#67C23A', increase: '8%' },
  { title: '活跃会员', value: 45, icon: 'User', color: '#E6A23C', increase: '5%' },
  { title: '库存预警', value: 7, icon: 'Warning', color: '#F56C6C', increase: '-2%' }
])

// 热销商品图表
let salesChart = null
const salesChartRef = ref(null)

// 营收趋势图表
let revenueChart = null
const revenueChartRef = ref(null)

// 库存预警列表
const lowStockItems = ref([
  { id: 1, name: '伏特加', category: '烈酒', stock: 5, threshold: 10 },
  { id: 2, name: '金酒', category: '烈酒', stock: 3, threshold: 10 },
  { id: 3, name: '威士忌', category: '烈酒', stock: 8, threshold: 15 },
  { id: 4, name: '龙舌兰', category: '烈酒', stock: 4, threshold: 10 },
  { id: 5, name: '百利甜', category: '利口酒', stock: 2, threshold: 8 }
])

// 最近订单列表
const recentOrders = ref([
  { id: 'O2023060101', table: 'A12', amount: 358, time: '10:24', status: 'processing' },
  { id: 'O2023060102', table: 'B08', amount: 592, time: '10:18', status: 'completed' },
  { id: 'O2023060103', table: 'C05', amount: 147, time: '10:05', status: 'completed' },
  { id: 'O2023060104', table: 'A03', amount: 437, time: '09:46', status: 'completed' },
  { id: 'O2023060105', table: 'D01', amount: 283, time: '09:30', status: 'completed' }
])

// 订单状态标签
const orderStatusMap = {
  processing: { type: 'warning', label: '进行中' },
  completed: { type: 'success', label: '已完成' },
  cancelled: { type: 'danger', label: '已取消' }
}

// 初始化图表
onMounted(() => {
  // 初始化热销商品图表
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    
    const salesOption = {
      title: {
        text: '本周热销商品',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['莫吉托', '马提尼', '长岛冰茶', '玛格丽特', '其他']
      },
      series: [
        {
          name: '销售量',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 235, name: '莫吉托' },
            { value: 198, name: '马提尼' },
            { value: 152, name: '长岛冰茶' },
            { value: 134, name: '玛格丽特' },
            { value: 212, name: '其他' }
          ]
        }
      ]
    }
    
    salesChart.setOption(salesOption)
  }
  
  // 初始化营收趋势图表
  if (revenueChartRef.value) {
    revenueChart = echarts.init(revenueChartRef.value)
    
    const revenueOption = {
      title: {
        text: '近期营收趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: '{value} 元'
          }
        }
      ],
      series: [
        {
          name: '营业额',
          type: 'bar',
          barWidth: '60%',
          data: [
            { value: 10280, itemStyle: { color: '#91cc75' } },
            { value: 12490, itemStyle: { color: '#91cc75' } },
            { value: 9860, itemStyle: { color: '#91cc75' } },
            { value: 13670, itemStyle: { color: '#91cc75' } },
            { value: 18920, itemStyle: { color: '#91cc75' } },
            { value: 23760, itemStyle: { color: '#91cc75' } },
            { value: 19850, itemStyle: { color: '#91cc75' } }
          ]
        }
      ]
    }
    
    revenueChart.setOption(revenueOption)
  }
  
  // 窗口大小变化时，重新调整图表大小
  window.addEventListener('resize', () => {
    salesChart && salesChart.resize()
    revenueChart && revenueChart.resize()
  })
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statsCards" :key="index">
          <el-card class="stat-card" :body-style="{ padding: '0px' }">
            <div class="card-content" :style="{ borderColor: item.color }">
              <div class="card-icon" :style="{ backgroundColor: item.color }">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-value">{{ item.value }}</div>
                <div class="card-increase" :class="{ 'increase-up': !item.increase.includes('-') }">
                  <el-icon><component :is="!item.increase.includes('-') ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                  {{ item.increase }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="chart-card">
            <div ref="salesChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="chart-card">
            <div ref="revenueChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 信息面板 -->
    <div class="info-section">
      <el-row :gutter="20">
        <!-- 库存预警 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>库存预警</span>
                <el-button class="button" text>查看全部</el-button>
              </div>
            </template>
            <el-table :data="lowStockItems" style="width: 100%" size="large">
              <el-table-column prop="name" label="商品名称" />
              <el-table-column prop="category" label="类别" width="100" />
              <el-table-column prop="stock" label="当前库存" width="100" align="center" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-tag type="danger" effect="dark" size="small">
                    低于阈值 ({{ scope.row.threshold }})
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 最近订单 -->
        <el-col :xs="24" :sm="24" :md="12">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>最近订单</span>
                <el-button class="button" text>查看全部</el-button>
              </div>
            </template>
            <el-table :data="recentOrders" style="width: 100%" size="large">
              <el-table-column prop="id" label="订单号" width="120" />
              <el-table-column prop="table" label="桌号" width="80" align="center" />
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="scope">
                  <span>￥{{ scope.row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="时间" width="80" align="center" />
              <el-table-column label="状态" align="center">
                <template #default="scope">
                  <el-tag 
                    :type="orderStatusMap[scope.row.status].type" 
                    effect="plain" 
                    size="small"
                  >
                    {{ orderStatusMap[scope.row.status].label }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .stat-cards {
    margin-bottom: 20px;
    
    .stat-card {
      margin-bottom: 20px;
      border-radius: 4px;
      overflow: hidden;
      
      .card-content {
        display: flex;
        align-items: center;
        padding: 20px;
        border-left: 4px solid #ccc;
        
        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 15px;
          
          .el-icon {
            font-size: 30px;
            color: #fff;
          }
        }
        
        .card-info {
          flex: 1;
          
          .card-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 5px;
          }
          
          .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }
          
          .card-increase {
            font-size: 12px;
            color: #F56C6C;
            display: flex;
            align-items: center;
            
            &.increase-up {
              color: #67C23A;
            }
            
            .el-icon {
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
  
  .chart-section {
    margin-bottom: 20px;
    
    .chart-card {
      margin-bottom: 20px;
      
      .chart {
        height: 350px;
      }
    }
  }
  
  .info-section {
    .info-card {
      margin-bottom: 20px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .dashboard-container {
    .chart-section {
      .chart-card {
        .chart {
          height: 300px;
        }
      }
    }
  }
}
</style> 
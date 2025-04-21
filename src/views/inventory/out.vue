<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getInventoryOutHistory } from '@/api/inventory'
import { ElMessage } from 'element-plus'

// 加载状态
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dateRange: [],
  inventoryId: '',
  outType: ''
})

// 出库类型选项
const outTypeOptions = [
  { value: 'sell', label: '销售出库' },
  { value: 'damage', label: '损耗出库' },
  { value: 'return', label: '退货出库' },
  { value: 'transfer', label: '调拨出库' },
  { value: 'other', label: '其他出库' }
]

// 出库记录数据
const outHistoryList = ref([])

// 获取出库历史
const getOutHistory = () => {
  loading.value = true
  
  // 处理日期范围
  let params = { ...queryParams }
  if (params.dateRange && params.dateRange.length === 2) {
    params.startDate = params.dateRange[0]
    params.endDate = params.dateRange[1]
  }
  delete params.dateRange
  
  getInventoryOutHistory(params).then(response => {
    // 模拟接口响应数据
    outHistoryList.value = [
      { id: 1, inventoryName: '伏特加', category: '烈酒', quantity: 2, price: 120, totalAmount: 240, outType: 'sell', outDate: '2023-06-01', orderId: 'O2023060101', operatorName: '王五', remark: '酒吧销售' },
      { id: 2, inventoryName: '金酒', category: '烈酒', quantity: 1, price: 150, totalAmount: 150, outType: 'sell', outDate: '2023-06-01', orderId: 'O2023060101', operatorName: '王五', remark: '酒吧销售' },
      { id: 3, inventoryName: '威士忌', category: '烈酒', quantity: 1, price: 180, totalAmount: 180, outType: 'sell', outDate: '2023-06-02', orderId: 'O2023060102', operatorName: '赵六', remark: '酒吧销售' },
      { id: 4, inventoryName: '龙舌兰', category: '烈酒', quantity: 1, price: 160, totalAmount: 160, outType: 'damage', outDate: '2023-06-03', orderId: '', operatorName: '张三', remark: '瓶子破损' },
      { id: 5, inventoryName: '青岛啤酒', category: '啤酒', quantity: 24, price: 15, totalAmount: 360, outType: 'sell', outDate: '2023-06-04', orderId: 'O2023060103', operatorName: '李四', remark: '酒吧销售' },
      { id: 6, inventoryName: '百利甜', category: '利口酒', quantity: 1, price: 130, totalAmount: 130, outType: 'return', outDate: '2023-06-05', orderId: '', operatorName: '张三', remark: '产品过期' },
      { id: 7, inventoryName: '橙汁', category: '其他', quantity: 5, price: 8, totalAmount: 40, outType: 'sell', outDate: '2023-06-05', orderId: 'O2023060104', operatorName: '王五', remark: '酒吧销售' }
    ]
    total.value = outHistoryList.value.length
    loading.value = false
  }).catch(error => {
    loading.value = false
    ElMessage.error('获取出库历史失败')
  })
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getOutHistory()
}

// 重置查询
const resetQuery = () => {
  queryParams.dateRange = []
  queryParams.inventoryId = ''
  queryParams.outType = ''
  queryParams.pageNum = 1
  getOutHistory()
}

// 处理分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getOutHistory()
}

const handleCurrentChange = (current) => {
  queryParams.pageNum = current
  getOutHistory()
}

// 获取出库类型标签类型
const getOutTypeTagType = (type) => {
  const map = {
    sell: 'success',
    damage: 'danger',
    return: 'warning',
    transfer: 'info',
    other: ''
  }
  return map[type] || ''
}

// 获取出库类型标签文本
const getOutTypeLabel = (type) => {
  const map = {
    sell: '销售出库',
    damage: '损耗出库',
    return: '退货出库',
    transfer: '调拨出库',
    other: '其他出库'
  }
  return map[type] || type
}

// 导出出库记录
const exportOutHistory = () => {
  ElMessage.success('导出功能开发中')
}

// 库存选项
const inventoryOptions = ref([
  { value: 1, label: '伏特加 (烈酒)' },
  { value: 2, label: '金酒 (烈酒)' },
  { value: 3, label: '威士忌 (烈酒)' },
  { value: 4, label: '朗姆酒 (烈酒)' },
  { value: 5, label: '龙舌兰 (烈酒)' },
  { value: 6, label: '百利甜 (利口酒)' },
  { value: 7, label: '蓝柑橘 (利口酒)' },
  { value: 8, label: '青岛啤酒 (啤酒)' },
  { value: 9, label: '科罗娜 (啤酒)' },
  { value: 10, label: '橙汁 (其他)' }
])

// 统计数据
const statistics = reactive({
  todayOut: 5,
  todayAmount: 770,
  monthOut: 35,
  monthAmount: 5260
})

// 生命周期钩子
onMounted(() => {
  getOutHistory()
})
</script>

<template>
  <div class="inventory-out page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-title">今日出库数量</div>
          <div class="stat-value">{{ statistics.todayOut }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-title">今日出库金额</div>
          <div class="stat-value">¥{{ statistics.todayAmount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-title">本月出库数量</div>
          <div class="stat-value">{{ statistics.monthOut }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-title">本月出库金额</div>
          <div class="stat-value">¥{{ statistics.monthAmount }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 出库记录表格 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>出库记录</span>
          <el-button type="primary" icon="Download" @click="exportOutHistory">导出记录</el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px;"
          />
        </el-form-item>
        <el-form-item label="商品">
          <el-select 
            v-model="queryParams.inventoryId" 
            placeholder="选择商品"
            clearable
            style="width: 180px;"
          >
            <el-option 
              v-for="item in inventoryOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库类型">
          <el-select 
            v-model="queryParams.outType" 
            placeholder="选择类型"
            clearable
            style="width: 180px;"
          >
            <el-option 
              v-for="item in outTypeOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 历史数据表格 -->
      <el-table
        v-loading="loading"
        :data="outHistoryList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column prop="inventoryName" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="80" align="center" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="price" label="单价" width="80" align="center">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="100" align="center">
          <template #default="scope">
            ¥{{ scope.row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="outType" label="出库类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getOutTypeTagType(scope.row.outType)" effect="light">
              {{ getOutTypeLabel(scope.row.outType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="outDate" label="出库日期" width="100" align="center" />
        <el-table-column prop="orderId" label="关联订单" width="120" align="center">
          <template #default="scope">
            <el-link 
              v-if="scope.row.orderId" 
              type="primary" 
              :underline="false"
            >
              {{ scope.row.orderId }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="80" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.inventory-out {
  .statistics-row {
    margin-bottom: 20px;
    
    .stat-card {
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .stat-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 10px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
  
  .history-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
    
    .search-form {
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

@media screen and (max-width: 768px) {
  .inventory-out {
    .statistics-row {
      .el-col {
        margin-bottom: 10px;
      }
    }
    
    .search-form {
      :deep(.el-form-item) {
        margin-bottom: 10px;
      }
    }
  }
}
</style> 
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getInventoryAlerts, setInventoryAlert, updateInventory } from '@/api/inventory'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 加载状态
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  category: '',
  status: ''
})

// 类别选项
const categoryOptions = [
  { value: '烈酒', label: '烈酒' },
  { value: '啤酒', label: '啤酒' },
  { value: '葡萄酒', label: '葡萄酒' },
  { value: '利口酒', label: '利口酒' },
  { value: '起泡酒', label: '起泡酒' },
  { value: '食材', label: '食材' },
  { value: '其他', label: '其他' }
]

// 状态选项
const statusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'low', label: '库存低' },
  { value: 'out', label: '缺货' }
]

// 预警列表数据
const alertList = ref([])

// 获取库存预警列表
const getAlertList = () => {
  loading.value = true
  getInventoryAlerts(queryParams).then(response => {
    // 模拟接口响应数据
    alertList.value = [
      { id: 1, name: '伏特加', category: '烈酒', stock: 5, threshold: 10, unit: '瓶', status: 'low', lastInDate: '2023-05-20', lastOutDate: '2023-06-01', supplierName: '北京酒水批发有限公司', suggestion: '建议补货' },
      { id: 2, name: '金酒', category: '烈酒', stock: 3, threshold: 10, unit: '瓶', status: 'low', lastInDate: '2023-05-15', lastOutDate: '2023-06-01', supplierName: '上海进口酒业贸易有限公司', suggestion: '建议补货' },
      { id: 3, name: '威士忌', category: '烈酒', stock: 8, threshold: 15, unit: '瓶', status: 'low', lastInDate: '2023-05-10', lastOutDate: '2023-06-02', supplierName: '广州饮料供应链有限公司', suggestion: '建议补货' },
      { id: 4, name: '龙舌兰', category: '烈酒', stock: 4, threshold: 10, unit: '瓶', status: 'low', lastInDate: '2023-05-28', lastOutDate: '2023-06-03', supplierName: '北京酒水批发有限公司', suggestion: '建议补货' },
      { id: 5, name: '百利甜', category: '利口酒', stock: 2, threshold: 8, unit: '瓶', status: 'low', lastInDate: '2023-05-22', lastOutDate: '2023-06-05', supplierName: '深圳酒类专营店', suggestion: '建议补货' },
      { id: 6, name: '橙汁', category: '其他', stock: 0, threshold: 5, unit: '升', status: 'out', lastInDate: '2023-05-19', lastOutDate: '2023-06-05', supplierName: '广州饮料供应链有限公司', suggestion: '紧急补货' }
    ]
    total.value = alertList.value.length
    loading.value = false
    initCharts()
  }).catch(error => {
    loading.value = false
    ElMessage.error('获取库存预警列表失败')
  })
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getAlertList()
}

// 重置查询
const resetQuery = () => {
  queryParams.category = ''
  queryParams.status = ''
  queryParams.pageNum = 1
  getAlertList()
}

// 处理分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getAlertList()
}

const handleCurrentChange = (current) => {
  queryParams.pageNum = current
  getAlertList()
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const map = {
    normal: 'success',
    low: 'warning',
    out: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const map = {
    normal: '正常',
    low: '库存低',
    out: '缺货'
  }
  return map[status] || status
}

// 编辑预警阈值对话框
const thresholdDialog = ref(false)
const currentItem = ref({})

// 处理编辑阈值
const handleEditThreshold = (row) => {
  currentItem.value = { ...row }
  thresholdDialog.value = true
}

// 更新阈值
const updateThreshold = () => {
  if (currentItem.value.threshold < 0) {
    ElMessage.warning('阈值不能小于0')
    return
  }
  
  loading.value = true
  setInventoryAlert({
    inventoryId: currentItem.value.id,
    threshold: currentItem.value.threshold
  }).then(() => {
    ElMessage.success('更新阈值成功')
    thresholdDialog.value = false
    getAlertList()
    loading.value = false
  }).catch(() => {
    loading.value = false
    ElMessage.error('更新阈值失败')
  })
}

// 快速补货对话框
const replenishDialog = ref(false)
const replenishForm = reactive({
  inventoryId: '',
  name: '',
  category: '',
  currentStock: 0,
  addStock: 0,
  totalStock: 0,
  supplier: '',
  remark: ''
})

// 处理快速补货
const handleReplenish = (row) => {
  replenishForm.inventoryId = row.id
  replenishForm.name = row.name
  replenishForm.category = row.category
  replenishForm.currentStock = row.stock
  replenishForm.addStock = row.threshold - row.stock > 0 ? row.threshold - row.stock : 0
  replenishForm.totalStock = row.stock + replenishForm.addStock
  replenishForm.supplier = row.supplierName
  replenishForm.remark = ''
  
  replenishDialog.value = true
}

// 计算总库存
const calculateTotalStock = () => {
  replenishForm.totalStock = replenishForm.currentStock + replenishForm.addStock
}

// 提交补货
const submitReplenish = () => {
  if (replenishForm.addStock <= 0) {
    ElMessage.warning('补货数量必须大于0')
    return
  }
  
  loading.value = true
  // 实际项目中应该调用入库API和更新库存API
  updateInventory({
    id: replenishForm.inventoryId,
    stock: replenishForm.totalStock
  }).then(() => {
    ElMessage.success('补货成功')
    replenishDialog.value = false
    getAlertList()
    loading.value = false
  }).catch(() => {
    loading.value = false
    ElMessage.error('补货失败')
  })
}

// 发送采购提醒
const sendPurchaseReminder = (row) => {
  ElMessageBox.confirm(
    `确定要发送 ${row.name} 的采购提醒吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: `已发送采购提醒至采购部门`
    })
  }).catch(() => {
    // 取消操作
  })
}

// 导出列表
const exportAlertList = () => {
  ElMessage.success('导出功能开发中')
}

// 图表相关
let categoryChart = null
const categoryChartRef = ref(null)
let statusChart = null
const statusChartRef = ref(null)

// 初始化图表
const initCharts = () => {
  // 等待DOM更新
  setTimeout(() => {
    // 类别分布图表
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value)
      
      // 处理数据
      const categoryData = {}
      alertList.value.forEach(item => {
        if (categoryData[item.category]) {
          categoryData[item.category]++
        } else {
          categoryData[item.category] = 1
        }
      })
      
      const categoryOption = {
        title: {
          text: '预警商品类别分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: Object.keys(categoryData)
        },
        series: [
          {
            name: '类别分布',
            type: 'pie',
            radius: '50%',
            data: Object.keys(categoryData).map(key => ({
              name: key,
              value: categoryData[key]
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      categoryChart.setOption(categoryOption)
    }
    
    // 状态分布图表
    if (statusChartRef.value) {
      statusChart = echarts.init(statusChartRef.value)
      
      // 处理数据
      const statusData = {}
      alertList.value.forEach(item => {
        if (statusData[item.status]) {
          statusData[item.status]++
        } else {
          statusData[item.status] = 1
        }
      })
      
      const statusLabels = {
        normal: '正常',
        low: '库存低',
        out: '缺货'
      }
      
      const statusColors = {
        normal: '#67C23A',
        low: '#E6A23C',
        out: '#F56C6C'
      }
      
      const statusOption = {
        title: {
          text: '预警商品状态分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: Object.keys(statusData).map(key => statusLabels[key] || key)
        },
        series: [
          {
            name: '状态分布',
            type: 'pie',
            radius: '50%',
            data: Object.keys(statusData).map(key => ({
              name: statusLabels[key] || key,
              value: statusData[key],
              itemStyle: {
                color: statusColors[key]
              }
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
      statusChart.setOption(statusOption)
    }
    
    // 窗口大小变化时，重新调整图表大小
    window.addEventListener('resize', () => {
      categoryChart && categoryChart.resize()
      statusChart && statusChart.resize()
    })
  }, 300)
}

// 生命周期钩子
onMounted(() => {
  getAlertList()
})
</script>

<template>
  <div class="inventory-alert page-container">
    <!-- 统计图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card">
          <div ref="categoryChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card">
          <div ref="statusChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 预警列表 -->
    <el-card class="alert-card">
      <template #header>
        <div class="card-header">
          <span>库存预警列表</span>
          <el-button type="primary" icon="Download" @click="exportAlertList">导出列表</el-button>
        </div>
      </template>
      
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="类别">
          <el-select 
            v-model="queryParams.category" 
            placeholder="选择类别"
            clearable
            style="width: 180px;"
          >
            <el-option 
              v-for="item in categoryOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="queryParams.status" 
            placeholder="选择状态"
            clearable
            style="width: 180px;"
          >
            <el-option 
              v-for="item in statusOptions" 
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
      
      <!-- 预警数据表格 -->
      <el-table
        v-loading="loading"
        :data="alertList"
        style="width: 100%"
        border
        :row-class-name="row => row.status === 'out' ? 'warning-row' : ''"
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="80" align="center" />
        <el-table-column label="库存情况" width="180" align="center">
          <template #default="scope">
            <el-progress 
              :percentage="Math.min(100, Math.round(scope.row.stock / scope.row.threshold * 100))" 
              :status="scope.row.stock === 0 ? 'exception' : scope.row.stock < scope.row.threshold ? 'warning' : 'success'"
              :stroke-width="16"
            >
              <span>{{ scope.row.stock }} / {{ scope.row.threshold }} {{ scope.row.unit }}</span>
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" effect="dark">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastInDate" label="最后入库" width="100" align="center" />
        <el-table-column prop="lastOutDate" label="最后出库" width="100" align="center" />
        <el-table-column prop="supplierName" label="供应商" min-width="150" show-overflow-tooltip />
        <el-table-column prop="suggestion" label="建议" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              link
              icon="Edit"
              @click="handleEditThreshold(scope.row)"
            >
              设置阈值
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              link
              icon="Plus"
              @click="handleReplenish(scope.row)"
            >
              快速补货
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              link
              icon="Message"
              @click="sendPurchaseReminder(scope.row)"
            >
              采购提醒
            </el-button>
          </template>
        </el-table-column>
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
    
    <!-- 编辑阈值对话框 -->
    <el-dialog
      v-model="thresholdDialog"
      title="设置库存预警阈值"
      width="400px"
      append-to-body
    >
      <el-form label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="currentItem.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="currentItem.stock" disabled>
            <template #append>{{ currentItem.unit }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="预警阈值">
          <el-input-number v-model="currentItem.threshold" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="thresholdDialog = false">取消</el-button>
          <el-button type="primary" @click="updateThreshold">确定</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 快速补货对话框 -->
    <el-dialog
      v-model="replenishDialog"
      title="快速补货"
      width="500px"
      append-to-body
    >
      <el-form label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="replenishForm.name" disabled />
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="replenishForm.category" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input v-model="replenishForm.currentStock" disabled />
        </el-form-item>
        <el-form-item label="补货数量">
          <el-input-number 
            v-model="replenishForm.addStock" 
            :min="1" 
            style="width: 100%"
            @change="calculateTotalStock"
          />
        </el-form-item>
        <el-form-item label="补货后库存">
          <el-input v-model="replenishForm.totalStock" disabled />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="replenishForm.supplier" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="replenishForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="replenishDialog = false">取消</el-button>
          <el-button type="primary" @click="submitReplenish">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.inventory-alert {
  .chart-row {
    margin-bottom: 20px;
    
    .chart-card {
      .chart {
        height: 300px;
      }
    }
  }
  
  .alert-card {
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

:deep(.warning-row) {
  background-color: #fff8f8;
}

@media screen and (max-width: 768px) {
  .inventory-alert {
    .chart-row {
      .chart-card {
        margin-bottom: 20px;
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
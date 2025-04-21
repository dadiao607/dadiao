<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getInventoryList, addInventoryIn, getInventoryInHistory } from '@/api/inventory'
import { ElMessage, ElMessageBox } from 'element-plus'

// 库存列表数据
const inventoryOptions = ref([])
const loading = ref(false)
const loadingHistory = ref(false)
const total = ref(0)

// 获取库存选项
const getInventoryOptions = () => {
  loading.value = true
  getInventoryList({ pageSize: 100 }).then(response => {
    // 模拟接口响应数据
    const items = [
      { id: 1, name: '伏特加', category: '烈酒', price: 120, cost: 80, stock: 25, unit: '瓶' },
      { id: 2, name: '金酒', category: '烈酒', price: 150, cost: 100, stock: 18, unit: '瓶' },
      { id: 3, name: '威士忌', category: '烈酒', price: 180, cost: 120, stock: 8, unit: '瓶' },
      { id: 4, name: '朗姆酒', category: '烈酒', price: 140, cost: 90, stock: 20, unit: '瓶' },
      { id: 5, name: '龙舌兰', category: '烈酒', price: 160, cost: 110, stock: 4, unit: '瓶' },
      { id: 6, name: '百利甜', category: '利口酒', price: 130, cost: 85, stock: 2, unit: '瓶' },
      { id: 7, name: '蓝柑橘', category: '利口酒', price: 125, cost: 80, stock: 12, unit: '瓶' },
      { id: 8, name: '青岛啤酒', category: '啤酒', price: 15, cost: 8, stock: 48, unit: '瓶' },
      { id: 9, name: '科罗娜', category: '啤酒', price: 20, cost: 12, stock: 36, unit: '瓶' },
      { id: 10, name: '橙汁', category: '其他', price: 8, cost: 3, stock: 0, unit: '升' }
    ]
    inventoryOptions.value = items.map(item => ({
      value: item.id,
      label: `${item.name} (${item.category})`,
      ...item
    }))
    loading.value = false
  }).catch(error => {
    loading.value = false
    ElMessage.error('获取库存列表失败')
  })
}

// 入库表单
const inForm = reactive({
  inventoryId: '',
  quantity: 1,
  price: 0,
  totalAmount: 0,
  supplier: '',
  purchaseDate: new Date(),
  remark: ''
})

// 表单验证规则
const inFormRules = {
  inventoryId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入入库单价', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  purchaseDate: [{ required: true, message: '请选择采购日期', trigger: 'change' }]
}

// 表单引用
const inFormRef = ref(null)

// 供应商选项
const supplierOptions = [
  { value: '北京酒水批发有限公司', label: '北京酒水批发有限公司' },
  { value: '上海进口酒业贸易有限公司', label: '上海进口酒业贸易有限公司' },
  { value: '广州饮料供应链有限公司', label: '广州饮料供应链有限公司' },
  { value: '深圳酒类专营店', label: '深圳酒类专营店' }
]

// 监听商品变化，自动填充价格
const handleInventoryChange = (id) => {
  const selected = inventoryOptions.value.find(item => item.value === id)
  if (selected) {
    inForm.price = selected.cost
    calculateTotal()
  }
}

// 计算总金额
const calculateTotal = () => {
  inForm.totalAmount = inForm.quantity * inForm.price
}

// 提交入库表单
const submitInForm = () => {
  inFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 构造提交数据
      const data = {
        ...inForm,
        purchaseDate: inForm.purchaseDate.toISOString().split('T')[0]
      }
      
      // 调用入库API
      addInventoryIn(data).then(() => {
        ElMessage.success('入库成功')
        resetForm()
        getInHistory() // 刷新入库历史
        loading.value = false
      }).catch(() => {
        loading.value = false
        ElMessage.error('入库失败')
      })
    }
  })
}

// 重置表单
const resetForm = () => {
  inFormRef.value.resetFields()
  inForm.quantity = 1
  inForm.price = 0
  inForm.totalAmount = 0
}

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  dateRange: [],
  inventoryId: '',
  supplier: ''
})

// 入库历史数据
const inHistoryList = ref([])

// 获取入库历史
const getInHistory = () => {
  loadingHistory.value = true
  
  // 处理日期范围
  let params = { ...queryParams }
  if (params.dateRange && params.dateRange.length === 2) {
    params.startDate = params.dateRange[0]
    params.endDate = params.dateRange[1]
  }
  delete params.dateRange
  
  getInventoryInHistory(params).then(response => {
    // 模拟接口响应数据
    inHistoryList.value = [
      { id: 1, inventoryName: '伏特加', category: '烈酒', quantity: 20, price: 80, totalAmount: 1600, supplier: '北京酒水批发有限公司', purchaseDate: '2023-06-01', operatorName: '张三', status: 'completed' },
      { id: 2, inventoryName: '金酒', category: '烈酒', quantity: 15, price: 100, totalAmount: 1500, supplier: '上海进口酒业贸易有限公司', purchaseDate: '2023-06-02', operatorName: '李四', status: 'completed' },
      { id: 3, inventoryName: '威士忌', category: '烈酒', quantity: 10, price: 120, totalAmount: 1200, supplier: '广州饮料供应链有限公司', purchaseDate: '2023-06-03', operatorName: '王五', status: 'completed' },
      { id: 4, inventoryName: '青岛啤酒', category: '啤酒', quantity: 100, price: 8, totalAmount: 800, supplier: '北京酒水批发有限公司', purchaseDate: '2023-06-04', operatorName: '赵六', status: 'completed' },
      { id: 5, inventoryName: '橙汁', category: '其他', quantity: 20, price: 3, totalAmount: 60, supplier: '广州饮料供应链有限公司', purchaseDate: '2023-06-05', operatorName: '张三', status: 'completed' }
    ]
    total.value = inHistoryList.value.length
    loadingHistory.value = false
  }).catch(error => {
    loadingHistory.value = false
    ElMessage.error('获取入库历史失败')
  })
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getInHistory()
}

// 重置查询
const resetQuery = () => {
  queryParams.dateRange = []
  queryParams.inventoryId = ''
  queryParams.supplier = ''
  queryParams.pageNum = 1
  getInHistory()
}

// 处理分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getInHistory()
}

const handleCurrentChange = (current) => {
  queryParams.pageNum = current
  getInHistory()
}

// 生命周期钩子
onMounted(() => {
  getInventoryOptions()
  getInHistory()
})
</script>

<template>
  <div class="inventory-in page-container">
    <el-row :gutter="20">
      <!-- 入库表单 -->
      <el-col :xs="24" :md="12">
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>商品入库</span>
            </div>
          </template>
          
          <el-form 
            ref="inFormRef" 
            :model="inForm" 
            :rules="inFormRules" 
            label-width="100px"
          >
            <el-form-item label="选择商品" prop="inventoryId">
              <el-select 
                v-model="inForm.inventoryId" 
                filterable 
                placeholder="请选择商品"
                style="width: 100%"
                @change="handleInventoryChange"
              >
                <el-option 
                  v-for="item in inventoryOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="入库数量" prop="quantity">
              <el-input-number 
                v-model="inForm.quantity" 
                :min="1" 
                style="width: 100%"
                @change="calculateTotal"
              />
            </el-form-item>
            
            <el-form-item label="入库单价" prop="price">
              <el-input-number 
                v-model="inForm.price" 
                :min="0" 
                :precision="2" 
                style="width: 100%"
                @change="calculateTotal"
              />
            </el-form-item>
            
            <el-form-item label="总金额">
              <el-input 
                v-model="inForm.totalAmount" 
                disabled 
                style="width: 100%"
              >
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="供应商" prop="supplier">
              <el-select 
                v-model="inForm.supplier"
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入供应商"
                style="width: 100%"
              >
                <el-option 
                  v-for="item in supplierOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="采购日期" prop="purchaseDate">
              <el-date-picker 
                v-model="inForm.purchaseDate" 
                type="date" 
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="备注" prop="remark">
              <el-input 
                v-model="inForm.remark" 
                type="textarea" 
                :rows="3" 
                placeholder="请输入备注信息"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item>
              <div class="form-buttons">
                <el-button type="primary" @click="submitInForm" :loading="loading">提交入库</el-button>
                <el-button @click="resetForm">重置</el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 入库历史 -->
      <el-col :xs="24" :md="12">
        <el-card class="history-card">
          <template #header>
            <div class="card-header">
              <span>入库历史</span>
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
            <el-form-item label="供应商">
              <el-select 
                v-model="queryParams.supplier" 
                placeholder="选择供应商"
                clearable
                style="width: 180px;"
              >
                <el-option 
                  v-for="item in supplierOptions" 
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
            v-loading="loadingHistory"
            :data="inHistoryList"
            style="width: 100%"
            border
            stripe
            size="large"
          >
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
            <el-table-column prop="supplier" label="供应商" min-width="150" show-overflow-tooltip />
            <el-table-column prop="purchaseDate" label="采购日期" width="100" align="center" />
            <el-table-column prop="operatorName" label="操作人" width="80" align="center" />
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              small
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.inventory-in {
  .form-card, .history-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
  }
  
  .form-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
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

@media screen and (max-width: 768px) {
  .inventory-in {
    .search-form {
      :deep(.el-form-item) {
        margin-bottom: 10px;
      }
    }
  }
}
</style> 
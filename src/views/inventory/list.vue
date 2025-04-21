<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getInventoryList, deleteInventory } from '@/api/inventory'
import { ElMessage, ElMessageBox } from 'element-plus'

// 库存列表数据
const inventoryList = ref([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
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

// 获取库存列表
const getList = () => {
  loading.value = true
  getInventoryList(queryParams).then(response => {
    // 模拟接口响应数据
    // 实际项目中，这里应该直接使用接口返回的数据
    inventoryList.value = [
      { id: 1, name: '伏特加', category: '烈酒', price: 120, cost: 80, stock: 25, unit: '瓶', threshold: 10, status: 'normal' },
      { id: 2, name: '金酒', category: '烈酒', price: 150, cost: 100, stock: 18, unit: '瓶', threshold: 10, status: 'normal' },
      { id: 3, name: '威士忌', category: '烈酒', price: 180, cost: 120, stock: 8, unit: '瓶', threshold: 15, status: 'low' },
      { id: 4, name: '朗姆酒', category: '烈酒', price: 140, cost: 90, stock: 20, unit: '瓶', threshold: 10, status: 'normal' },
      { id: 5, name: '龙舌兰', category: '烈酒', price: 160, cost: 110, stock: 4, unit: '瓶', threshold: 10, status: 'low' },
      { id: 6, name: '百利甜', category: '利口酒', price: 130, cost: 85, stock: 2, unit: '瓶', threshold: 8, status: 'low' },
      { id: 7, name: '蓝柑橘', category: '利口酒', price: 125, cost: 80, stock: 12, unit: '瓶', threshold: 8, status: 'normal' },
      { id: 8, name: '青岛啤酒', category: '啤酒', price: 15, cost: 8, stock: 48, unit: '瓶', threshold: 24, status: 'normal' },
      { id: 9, name: '科罗娜', category: '啤酒', price: 20, cost: 12, stock: 36, unit: '瓶', threshold: 24, status: 'normal' },
      { id: 10, name: '橙汁', category: '其他', price: 8, cost: 3, stock: 0, unit: '升', threshold: 5, status: 'out' }
    ]
    total.value = inventoryList.value.length
    loading.value = false
  }).catch(error => {
    loading.value = false
    ElMessage.error('获取库存列表失败')
  })
}

// 重置查询参数
const resetQuery = () => {
  queryParams.name = ''
  queryParams.category = ''
  queryParams.status = ''
  queryParams.pageNum = 1
  getList()
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 处理分页
const handleSizeChange = (size) => {
  queryParams.pageSize = size
  getList()
}

const handleCurrentChange = (current) => {
  queryParams.pageNum = current
  getList()
}

// 显示库存详情
const dialogVisible = ref(false)
const currentItem = ref({})

const showDetail = (row) => {
  currentItem.value = { ...row }
  dialogVisible.value = true
}

// 处理新增
const handleAdd = () => {
  currentItem.value = {
    name: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    unit: '瓶',
    threshold: 0,
    status: 'normal'
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  currentItem.value = { ...row }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteInventory(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    }).catch(() => {
      ElMessage.error('删除失败')
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 提交表单
const submitForm = () => {
  // 实际项目中，这里应该调用接口
  dialogVisible.value = false
  ElMessage.success('操作成功')
  getList()
}

// 状态标签样式
const getStatusTagType = (status) => {
  switch (status) {
    case 'normal':
      return 'success'
    case 'low':
      return 'warning'
    case 'out':
      return 'danger'
    default:
      return 'info'
  }
}

const getStatusLabel = (status) => {
  const map = {
    normal: '正常',
    low: '库存低',
    out: '缺货'
  }
  return map[status] || status
}

// 生命周期钩子
onMounted(() => {
  getList()
})
</script>

<template>
  <div class="inventory-list page-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="queryParams.category" placeholder="请选择类别" clearable>
            <el-option 
              v-for="item in categoryOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
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
    </el-card>
    
    <!-- 操作工具栏 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>库存列表</span>
          <div class="actions">
            <el-button type="primary" icon="Plus" @click="handleAdd">新增库存</el-button>
            <el-button type="success" icon="Upload">导入</el-button>
            <el-button type="info" icon="Download">导出</el-button>
          </div>
        </div>
      </template>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="inventoryList"
        style="width: 100%"
        border
        highlight-current-row
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column prop="name" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="category" label="类别" width="100" align="center" />
        <el-table-column prop="price" label="售价" width="100" align="center">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="成本" width="100" align="center">
          <template #default="scope">
            ¥{{ scope.row.cost }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="threshold" label="警戒值" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" effect="light">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              link
              icon="View"
              @click="showDetail(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              link
              icon="Edit"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="primary" 
              link
              icon="Delete"
              @click="handleDelete(scope.row)"
            >
              删除
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
    
    <!-- 详情/新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentItem.id ? (currentItem.id ? '编辑库存' : '库存详情') : '新增库存'"
      width="500px"
      append-to-body
    >
      <el-form 
        ref="formRef" 
        :model="currentItem" 
        label-width="80px"
        :rules="{
          name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
          category: [{ required: true, message: '请选择类别', trigger: 'change' }],
          price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
          cost: [{ required: true, message: '请输入成本', trigger: 'blur' }],
          stock: [{ required: true, message: '请输入库存量', trigger: 'blur' }],
          unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
          threshold: [{ required: true, message: '请输入警戒值', trigger: 'blur' }]
        }"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="currentItem.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="currentItem.category" placeholder="请选择类别" style="width: 100%">
            <el-option 
              v-for="item in categoryOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售价" prop="price">
          <el-input-number v-model="currentItem.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="成本" prop="cost">
          <el-input-number v-model="currentItem.cost" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="库存量" prop="stock">
          <el-input-number v-model="currentItem.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="currentItem.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="警戒值" prop="threshold">
          <el-input-number v-model="currentItem.threshold" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="currentItem.status" placeholder="请选择状态" style="width: 100%">
            <el-option 
              v-for="item in statusOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.inventory-list {
  .search-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .actions {
        display: flex;
        gap: 10px;
      }
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style> 
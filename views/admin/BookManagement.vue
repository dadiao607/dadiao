<template>
  <div class="book-management-container">
    <div class="page-header">
      <h1 class="page-title">图书管理</h1>
      <el-button type="primary" @click="handleAddBook">
        <el-icon><Plus /></el-icon> 添加图书
      </el-button>
    </div>
    
    <!-- 搜索和筛选 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图书标题、作者或ISBN"
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
          v-model="filterCategory"
          placeholder="图书分类"
          clearable
          class="filter-item"
          @change="handleSearch">
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
        
        <el-select
          v-model="filterStatus"
          placeholder="图书状态"
          clearable
          class="filter-item"
          @change="handleSearch">
          <el-option label="可借阅" value="available" />
          <el-option label="全部借出" value="borrowed" />
        </el-select>
        
        <el-select
          v-model="sortOption"
          placeholder="排序方式"
          class="filter-item"
          @change="handleSearch">
          <el-option label="添加时间 (新→旧)" value="createdDesc" />
          <el-option label="添加时间 (旧→新)" value="createdAsc" />
          <el-option label="名称 A-Z" value="titleAsc" />
          <el-option label="名称 Z-A" value="titleDesc" />
          <el-option label="借阅次数 (高→低)" value="borrowsDesc" />
        </el-select>
      </div>
    </el-card>
    
    <!-- 图书列表 -->
    <el-card shadow="never" class="book-table-card">
      <div v-loading="loading" class="book-table-container">
        <el-table
          :data="books"
          border
          style="width: 100%">
          <el-table-column label="图书信息" min-width="280">
            <template #default="{ row }">
              <div class="book-info-cell">
                <img :src="row.imageUrl || defaultCover" class="book-cover" />
                <div class="book-details">
                  <div class="book-title">{{ row.title }}</div>
                  <div class="book-author">{{ row.author }}</div>
                  <div class="book-category">
                    <el-tag size="small">{{ getCategoryLabel(row.category) }}</el-tag>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="isbn" label="ISBN" width="130" />
          
          <el-table-column prop="publisher" label="出版社" width="150" />
          
          <el-table-column prop="publicationYear" label="出版年份" width="100" />
          
          <el-table-column label="库存状态" width="100">
            <template #default="{ row }">
              <div class="inventory-status">
                <span class="inventory-count">{{ row.availableCopies }}/{{ row.totalCopies }}</span>
                <el-tag 
                  :type="row.availableCopies > 0 ? 'success' : 'danger'" 
                  size="small">
                  {{ row.availableCopies > 0 ? '可借阅' : '已借完' }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="borrowCount" label="借阅次数" width="100" sortable />
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleEditBook(row)">
                编辑
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                @click="handleManageInventory(row)">
                库存
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDeleteBook(row)">
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
            :total="totalBooks"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
    
    <!-- 图书编辑对话框 -->
    <el-dialog
      v-model="bookDialogVisible"
      :title="isEditMode ? '编辑图书' : '添加图书'"
      width="650px">
      <el-form
        ref="bookFormRef"
        :model="bookForm"
        :rules="bookRules"
        label-width="100px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="书名" prop="title">
              <el-input v-model="bookForm.title" />
            </el-form-item>
            
            <el-form-item label="作者" prop="author">
              <el-input v-model="bookForm.author" />
            </el-form-item>
            
            <el-form-item label="ISBN" prop="isbn">
              <el-input v-model="bookForm.isbn" />
            </el-form-item>
            
            <el-form-item label="分类" prop="category">
              <el-select v-model="bookForm.category" style="width: 100%">
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="出版社" prop="publisher">
              <el-input v-model="bookForm.publisher" />
            </el-form-item>
            
            <el-form-item label="出版年份" prop="publicationYear">
              <el-input v-model.number="bookForm.publicationYear" type="number" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="封面图">
              <div class="cover-upload">
                <el-upload
                  class="upload-container"
                  action="/api/uploads/image"
                  :show-file-list="false"
                  :on-success="handleUploadSuccess"
                  :before-upload="beforeUpload">
                  <img v-if="bookForm.imageUrl" :src="bookForm.imageUrl" class="preview-image" />
                  <div v-else class="upload-placeholder">
                    <el-icon><Plus /></el-icon>
                    <div class="upload-text">点击上传</div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="简介" prop="description">
          <el-input 
            v-model="bookForm.description" 
            type="textarea" 
            rows="4" />
        </el-form-item>
        
        <el-form-item v-if="!isEditMode" label="库存数量" prop="totalCopies">
          <el-input-number 
            v-model="bookForm.totalCopies" 
            :min="1" 
            :max="999" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bookDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="saveLoading"
            @click="saveBook">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 库存管理对话框 -->
    <el-dialog
      v-model="inventoryDialogVisible"
      title="库存管理"
      width="500px">
      <div v-if="selectedBook" class="inventory-management">
        <div class="inventory-book-info">
          <h3>{{ selectedBook.title }}</h3>
          <p>作者：{{ selectedBook.author }}</p>
        </div>
        
        <el-descriptions border>
          <el-descriptions-item label="总库存" :span="2">
            <el-input-number 
              v-model="inventoryForm.totalCopies" 
              :min="inventoryForm.borrowedCopies" 
              :max="999" 
              size="small" />
          </el-descriptions-item>
          <el-descriptions-item label="可借阅数量" :span="2">
            <span>{{ inventoryForm.totalCopies - inventoryForm.borrowedCopies }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="已借出数量" :span="2">
            <span>{{ inventoryForm.borrowedCopies }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="inventoryDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="saveLoading"
            @click="saveInventory">
            更新库存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useBookStore } from '@/store/book';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import axios from 'axios';

const bookStore = useBookStore();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(false);
const saveLoading = ref(false);
const books = ref([]);
const totalBooks = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const searchQuery = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const sortOption = ref('createdDesc');
const bookDialogVisible = ref(false);
const inventoryDialogVisible = ref(false);
const isEditMode = ref(false);
const selectedBook = ref(null);

// 分类选项
const categoryOptions = [
  { value: 'FICTION', label: '小说' },
  { value: 'NON_FICTION', label: '非小说' },
  { value: 'SCIENCE', label: '科学' },
  { value: 'TECHNOLOGY', label: '技术' },
  { value: 'HISTORY', label: '历史' },
  { value: 'PHILOSOPHY', label: '哲学' },
  { value: 'ART', label: '艺术' },
  { value: 'BIOGRAPHY', label: '传记' },
  { value: 'CHILDREN', label: '儿童' },
  { value: 'OTHER', label: '其他' }
];

// 表单引用
const bookFormRef = ref(null);

// 图书表单数据
const bookForm = reactive({
  id: '',
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  publicationYear: new Date().getFullYear(),
  description: '',
  imageUrl: '',
  totalCopies: 1
});

// 库存表单数据
const inventoryForm = reactive({
  bookId: '',
  totalCopies: 0,
  borrowedCopies: 0
});

// 表单校验规则
const bookRules = {
  title: [
    { required: true, message: '请输入书名', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择图书分类', trigger: 'change' }
  ],
  isbn: [
    { pattern: /^(?:\d{10}|\d{13})$/, message: 'ISBN必须是10位或13位数字', trigger: 'blur' }
  ],
  publicationYear: [
    { type: 'number', min: 1000, max: new Date().getFullYear(), message: '请输入有效的出版年份', trigger: 'blur' }
  ],
  totalCopies: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '库存数量必须大于0', trigger: 'blur' }
  ]
};

// 加载图书列表
const loadBooks = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      query: searchQuery.value,
      category: filterCategory.value,
      sort: sortOption.value
    };
    
    if (filterStatus.value === 'available') {
      params.available = true;
    } else if (filterStatus.value === 'borrowed') {
      params.available = false;
    }
    
    const response = await bookStore.fetchBooks(params);
    books.value = response.content;
    totalBooks.value = response.totalElements;
  } catch (error) {
    ElMessage.error('获取图书列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadBooks();
};

// 处理页面大小变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadBooks();
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadBooks();
};

// 获取分类标签
const getCategoryLabel = (value) => {
  const category = categoryOptions.find(item => item.value === value);
  return category ? category.label : value;
};

// 处理添加图书
const handleAddBook = () => {
  resetBookForm();
  isEditMode.value = false;
  bookDialogVisible.value = true;
};

// 处理编辑图书
const handleEditBook = (book) => {
  resetBookForm();
  isEditMode.value = true;
  
  // 填充表单数据
  Object.keys(bookForm).forEach(key => {
    if (book[key] !== undefined) {
      bookForm[key] = book[key];
    }
  });
  
  bookDialogVisible.value = true;
};

// 处理库存管理
const handleManageInventory = (book) => {
  selectedBook.value = book;
  
  inventoryForm.bookId = book.id;
  inventoryForm.totalCopies = book.totalCopies;
  inventoryForm.borrowedCopies = book.totalCopies - book.availableCopies;
  
  inventoryDialogVisible.value = true;
};

// 处理删除图书
const handleDeleteBook = async (book) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除《${book.title}》吗？此操作不可逆`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    await bookStore.deleteBook(book.id);
    ElMessage.success('图书删除成功');
    
    // 刷新图书列表
    loadBooks();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除图书失败');
    }
  } finally {
    loading.value = false;
  }
};

// 保存图书
const saveBook = async () => {
  if (!bookFormRef.value) return;
  
  try {
    await bookFormRef.value.validate();
    
    saveLoading.value = true;
    
    if (isEditMode.value) {
      // 更新图书
      await bookStore.updateBook(bookForm);
      ElMessage.success('图书更新成功');
    } else {
      // 创建图书
      await bookStore.createBook(bookForm);
      ElMessage.success('图书添加成功');
    }
    
    bookDialogVisible.value = false;
    
    // 刷新图书列表
    loadBooks();
  } catch (error) {
    ElMessage.error(error.message || '保存图书失败');
  } finally {
    saveLoading.value = false;
  }
};

// 保存库存
const saveInventory = async () => {
  try {
    saveLoading.value = true;
    
    await axios.put(`/api/books/${inventoryForm.bookId}/inventory`, {
      totalCopies: inventoryForm.totalCopies
    });
    
    ElMessage.success('库存更新成功');
    inventoryDialogVisible.value = false;
    
    // 刷新图书列表
    loadBooks();
  } catch (error) {
    ElMessage.error(error.message || '更新库存失败');
  } finally {
    saveLoading.value = false;
  }
};

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  
  return true;
};

// 上传成功回调
const handleUploadSuccess = (response) => {
  bookForm.imageUrl = response.url;
};

// 重置图书表单
const resetBookForm = () => {
  if (bookFormRef.value) {
    bookFormRef.value.resetFields();
  }
  
  bookForm.id = '';
  bookForm.title = '';
  bookForm.author = '';
  bookForm.isbn = '';
  bookForm.category = '';
  bookForm.publisher = '';
  bookForm.publicationYear = new Date().getFullYear();
  bookForm.description = '';
  bookForm.imageUrl = '';
  bookForm.totalCopies = 1;
};

// 组件挂载时加载数据
onMounted(() => {
  loadBooks();
});
</script>

<style scoped>
.book-management-container {
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

.book-table-card {
  margin-bottom: 20px;
}

.book-info-cell {
  display: flex;
  align-items: center;
}

.book-cover {
  width: 45px;
  height: 60px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 3px;
}

.book-details {
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: bold;
  margin-bottom: 3px;
  color: #303133;
}

.book-author {
  font-size: 12px;
  color: #606266;
  margin-bottom: 3px;
}

.book-category {
  margin-top: 3px;
}

.inventory-status {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.inventory-count {
  margin-bottom: 5px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.cover-upload {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.upload-container {
  width: 120px;
  height: 160px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
}

.upload-text {
  margin-top: 10px;
  font-size: 12px;
}

.inventory-management {
  padding: 0 20px;
}

.inventory-book-info {
  margin-bottom: 20px;
  text-align: center;
}

.inventory-book-info h3 {
  margin-bottom: 5px;
  color: #303133;
}

.inventory-book-info p {
  margin: 0;
  color: #606266;
}

@media (max-width: 768px) {
  .filter-item {
    width: 100%;
  }
  
  .book-info-cell {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .book-cover {
    margin-bottom: 10px;
  }
}
</style> 
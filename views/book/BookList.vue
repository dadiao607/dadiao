<template>
  <div class="book-list-container">
    <div class="book-list-header">
      <h1 class="page-title">图书目录</h1>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图书（书名、作者、ISBN）"
          clearable
          class="search-input"
          @keyup.enter="handleSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 过滤器和排序 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-container">
        <div class="filter-section">
          <span class="filter-label">分类：</span>
          <el-radio-group v-model="selectedCategory" size="small" @change="handleFilter">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button v-for="category in categoryOptions" :key="category.value" :label="category.value">
              {{ category.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-section">
          <span class="filter-label">筛选：</span>
          <el-checkbox v-model="onlyAvailable" @change="handleFilter">仅显示可借阅</el-checkbox>
        </div>
        
        <div class="filter-section">
          <span class="filter-label">排序：</span>
          <el-select v-model="sortOption" placeholder="排序方式" size="small" @change="handleFilter">
            <el-option label="最新上架" value="newest" />
            <el-option label="热门借阅" value="popular" />
            <el-option label="书名 A-Z" value="titleAsc" />
            <el-option label="书名 Z-A" value="titleDesc" />
          </el-select>
        </div>
      </div>
    </el-card>
    
    <!-- 图书列表 -->
    <div v-loading="loading" class="book-grid">
      <el-empty v-if="books.length === 0" description="暂无符合条件的图书" />
      
      <el-card
        v-for="book in books"
        :key="book.id"
        class="book-card"
        shadow="hover"
        :body-style="{ padding: '0px' }"
        @click="goToBookDetail(book.id)">
        
        <div class="book-cover">
          <img
            :src="book.imageUrl || defaultCover"
            :alt="book.title"
            class="cover-image" />
          <div class="book-status" :class="{ 'status-available': book.availableCopies > 0 }">
            {{ book.availableCopies > 0 ? '可借阅' : '已借完' }}
          </div>
        </div>
        
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <p class="book-category">{{ getCategoryLabel(book.category) }}</p>
          <div class="book-actions">
            <el-button 
              type="primary" 
              size="small" 
              plain
              :disabled="book.availableCopies <= 0"
              @click.stop="handleBorrow(book)">
              借阅
            </el-button>
            <el-button 
              type="info" 
              size="small" 
              plain
              @click.stop="goToBookDetail(book.id)">
              详情
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :small="false"
        layout="sizes, prev, pager, next, jumper, total"
        :total="totalBooks"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
    
    <!-- 借阅确认对话框 -->
    <el-dialog
      v-model="borrowDialogVisible"
      title="借阅确认"
      width="400px">
      <div v-if="selectedBook" class="borrow-confirmation">
        <p>您确定要借阅《{{ selectedBook.title }}》吗？</p>
        <div class="book-rules">
          <h4>借阅规则：</h4>
          <ul>
            <li>借阅期限为30天</li>
            <li>逾期将产生罚款</li>
            <li>借阅需经管理员审批</li>
          </ul>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="borrowDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="borrowLoading"
            @click="confirmBorrow">
            确认借阅
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/store/book';
import { useAuthStore } from '@/store/auth';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const router = useRouter();
const bookStore = useBookStore();
const authStore = useAuthStore();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(false);
const books = ref([]);
const totalBooks = ref(0);
const currentPage = ref(1);
const pageSize = ref(24);
const searchQuery = ref('');
const selectedCategory = ref('');
const onlyAvailable = ref(false);
const sortOption = ref('newest');
const borrowDialogVisible = ref(false);
const borrowLoading = ref(false);
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

// 获取分类名称
const getCategoryLabel = (categoryValue) => {
  const category = categoryOptions.find(item => item.value === categoryValue);
  return category ? category.label : categoryValue;
};

// 加载图书
const loadBooks = async () => {
  try {
    loading.value = true;
    
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      query: searchQuery.value,
      category: selectedCategory.value,
      onlyAvailable: onlyAvailable.value,
      sort: sortOption.value
    };
    
    const response = await bookStore.fetchBooks(params);
    books.value = response.content;
    totalBooks.value = response.totalElements;
  } catch (error) {
    ElMessage.error('获取图书列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  loadBooks();
};

// 处理过滤和排序
const handleFilter = () => {
  currentPage.value = 1;
  loadBooks();
};

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadBooks();
};

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadBooks();
};

// 跳转到图书详情页
const goToBookDetail = (bookId) => {
  router.push(`/books/${bookId}`);
};

// 处理借阅
const handleBorrow = (book) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再借阅图书');
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    return;
  }
  
  selectedBook.value = book;
  borrowDialogVisible.value = true;
};

// 确认借阅
const confirmBorrow = async () => {
  if (!selectedBook.value) return;
  
  try {
    borrowLoading.value = true;
    await bookStore.borrowBook(selectedBook.value.id);
    
    ElMessage.success('借阅申请已提交，请等待管理员审批');
    borrowDialogVisible.value = false;
    
    // 刷新图书列表
    loadBooks();
  } catch (error) {
    ElMessage.error(error.message || '借阅申请失败');
  } finally {
    borrowLoading.value = false;
  }
};

// 组件挂载时加载图书列表
onMounted(() => {
  loadBooks();
});
</script>

<style scoped>
.book-list-container {
  padding: 20px;
}

.book-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.8rem;
  color: #303133;
}

.search-bar {
  width: 400px;
  max-width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  color: #606266;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.book-card {
  height: 100%;
  transition: transform 0.3s;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 8px;
  background-color: #F56C6C;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.status-available {
  background-color: #67C23A;
}

.book-info {
  padding: 16px;
}

.book-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 0 0 4px;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-category {
  margin: 0 0 12px;
  font-size: 12px;
  color: #909399;
}

.book-actions {
  display: flex;
  justify-content: space-between;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.borrow-confirmation {
  text-align: center;
}

.book-rules {
  text-align: left;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.book-rules h4 {
  margin-top: 0;
  margin-bottom: 10px;
}

.book-rules ul {
  margin: 0;
  padding-left: 20px;
}

@media (max-width: 768px) {
  .book-list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-bar {
    width: 100%;
    margin-top: 15px;
  }
  
  .filter-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .book-cover {
    height: 180px;
  }
}
</style> 
<template>
  <div class="book-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="error" class="error-container">
      <el-empty description="图书信息加载失败" :image-size="200">
        <template #description>
          <p>{{ error }}</p>
        </template>
        <el-button type="primary" @click="router.push('/books')">返回图书列表</el-button>
      </el-empty>
    </div>
    
    <template v-else-if="book">
      <!-- 返回按钮 -->
      <div class="back-link">
        <el-link @click="router.back()" :underline="false">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-link>
      </div>
      
      <!-- 图书基本信息 -->
      <el-row :gutter="30" class="book-info-section">
        <el-col :xs="24" :sm="8" :md="6" class="book-cover-col">
          <div class="book-cover">
            <img :src="book.imageUrl || defaultCover" :alt="book.title" class="cover-image">
          </div>
          
          <!-- 借阅状态和操作按钮 -->
          <div class="book-actions">
            <div class="book-availability">
              <el-tag :type="book.availableCopies > 0 ? 'success' : 'danger'" size="large">
                {{ book.availableCopies > 0 ? `可借阅 (${book.availableCopies}/${book.totalCopies})` : '已借完' }}
              </el-tag>
            </div>
            
            <el-button 
              type="primary" 
              size="large" 
              class="borrow-button"
              :disabled="book.availableCopies <= 0 || !isLoggedIn"
              @click="handleBorrow">
              借阅图书
            </el-button>
            
            <el-button 
              v-if="!isLoggedIn"
              type="info" 
              size="small" 
              class="login-hint"
              @click="router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath))">
              登录后才能借阅
            </el-button>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="16" :md="18" class="book-details-col">
          <h1 class="book-title">{{ book.title }}</h1>
          
          <div class="book-meta">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="作者">{{ book.author }}</el-descriptions-item>
              <el-descriptions-item label="ISBN">{{ book.isbn || '暂无' }}</el-descriptions-item>
              <el-descriptions-item label="出版社">{{ book.publisher || '暂无' }}</el-descriptions-item>
              <el-descriptions-item label="出版年份">{{ book.publicationYear || '暂无' }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ getCategoryLabel(book.category) }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <!-- 图书详情内容 -->
          <div class="book-description">
            <h3>内容简介</h3>
            <div class="description-text">
              <p v-if="book.description">{{ book.description }}</p>
              <p v-else>暂无简介</p>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- 相关推荐 -->
      <div v-if="relatedBooks.length > 0" class="related-section">
        <h2 class="section-title">相关推荐</h2>
        
        <div class="related-books">
          <el-card
            v-for="relatedBook in relatedBooks"
            :key="relatedBook.id"
            shadow="hover"
            class="related-book-card"
            @click="goToBookDetail(relatedBook.id)">
            
            <div class="related-book-cover">
              <img 
                :src="relatedBook.imageUrl || defaultCover" 
                :alt="relatedBook.title" 
                class="related-cover-image">
            </div>
            
            <div class="related-book-info">
              <h4 class="related-book-title">{{ relatedBook.title }}</h4>
              <p class="related-book-author">{{ relatedBook.author }}</p>
            </div>
          </el-card>
        </div>
      </div>
    </template>
    
    <!-- 借阅确认对话框 -->
    <el-dialog
      v-model="borrowDialogVisible"
      title="借阅确认"
      width="400px">
      <div class="borrow-confirmation">
        <p>您确定要借阅《{{ book?.title }}》吗？</p>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '@/store/book';
import { useAuthStore } from '@/store/auth';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const authStore = useAuthStore();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(true);
const error = ref(null);
const book = ref(null);
const relatedBooks = ref([]);
const borrowDialogVisible = ref(false);
const borrowLoading = ref(false);

// 计算属性
const isLoggedIn = computed(() => authStore.isLoggedIn);

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

// 加载图书详情
const loadBookDetail = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const bookId = route.params.id;
    if (!bookId) {
      error.value = '图书ID无效';
      return;
    }
    
    book.value = await bookStore.fetchBookById(bookId);
    
    // 加载相关推荐图书
    if (book.value) {
      await loadRelatedBooks(book.value.category, book.value.id);
    }
  } catch (err) {
    error.value = '图书信息加载失败';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 加载相关推荐图书
const loadRelatedBooks = async (category, currentBookId) => {
  try {
    const params = {
      page: 0,
      size: 6,
      category: category
    };
    
    const response = await bookStore.fetchBooks(params);
    // 过滤掉当前图书
    relatedBooks.value = response.content
      .filter(book => book.id !== currentBookId)
      .slice(0, 5); // 最多显示5本
  } catch (error) {
    console.error('Failed to load related books', error);
  }
};

// 跳转到图书详情
const goToBookDetail = (bookId) => {
  router.push(`/books/${bookId}`);
};

// 处理借阅
const handleBorrow = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再借阅图书');
    router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
    return;
  }
  
  borrowDialogVisible.value = true;
};

// 确认借阅
const confirmBorrow = async () => {
  if (!book.value) return;
  
  try {
    borrowLoading.value = true;
    await bookStore.borrowBook(book.value.id);
    
    ElMessage.success('借阅申请已提交，请等待管理员审批');
    borrowDialogVisible.value = false;
    
    // 刷新图书详情
    await loadBookDetail();
  } catch (error) {
    ElMessage.error(error.message || '借阅申请失败');
  } finally {
    borrowLoading.value = false;
  }
};

// 组件挂载时加载图书详情
onMounted(() => {
  loadBookDetail();
});
</script>

<style scoped>
.book-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  padding: 40px;
  text-align: center;
}

.back-link {
  margin-bottom: 20px;
}

.book-info-section {
  margin-bottom: 40px;
}

.book-cover-col {
  margin-bottom: 30px;
}

.book-cover {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.cover-image {
  width: 100%;
  display: block;
}

.book-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.book-availability {
  display: flex;
  justify-content: center;
}

.borrow-button {
  width: 100%;
}

.login-hint {
  width: 100%;
}

.book-title {
  font-size: 28px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.book-meta {
  margin-bottom: 30px;
}

.book-description h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
}

.description-text {
  color: #606266;
  line-height: 1.6;
}

.section-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: #303133;
}

.related-books {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 20px;
}

.related-book-card {
  flex: 0 0 160px;
  cursor: pointer;
  transition: transform 0.3s;
}

.related-book-card:hover {
  transform: translateY(-5px);
}

.related-book-cover {
  height: 200px;
  overflow: hidden;
}

.related-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-book-info {
  padding: 10px;
}

.related-book-title {
  margin: 0 0 5px;
  font-size: 14px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-book-author {
  margin: 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .book-title {
    font-size: 24px;
  }
  
  .related-books {
    gap: 15px;
  }
  
  .related-book-card {
    flex: 0 0 140px;
  }
  
  .related-book-cover {
    height: 180px;
  }
}
</style> 
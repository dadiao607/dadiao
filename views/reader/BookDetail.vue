<template>
  <div class="book-detail-container">
    <el-row v-if="loading">
      <el-col :span="24" class="loading-container">
        <el-skeleton style="width: 100%" animated>
          <template #template>
            <el-skeleton-item variant="image" style="width: 240px; height: 320px" />
            <div style="padding: 14px">
              <el-skeleton-item variant="h3" style="width: 50%" />
              <div style="display: flex; align-items: center; margin-top: 16px">
                <el-skeleton-item variant="text" style="margin-right: 16px" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
              <el-skeleton-item variant="text" style="width: 100%; margin-top: 16px" />
              <el-skeleton-item variant="text" style="width: 100%; margin-top: 16px" />
              <el-skeleton-item variant="text" style="width: 100%; margin-top: 16px" />
            </div>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <div v-else-if="!book" class="not-found">
      <el-empty description="图书不存在或已被删除"></el-empty>
      <el-button type="primary" @click="router.push('/books')">浏览其他图书</el-button>
    </div>

    <template v-else>
      <el-row :gutter="30">
        <!-- 图书封面 -->
        <el-col :xs="24" :sm="8" :md="6" class="book-image-col">
          <div class="book-image-container">
            <el-image 
              :src="book.imageUrl || 'https://via.placeholder.com/300x400?text=No+Cover'" 
              fit="cover"
              class="book-image">
              <template #error>
                <div class="image-placeholder">
                  <el-icon size="40"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
        </el-col>
        
        <!-- 图书信息 -->
        <el-col :xs="24" :sm="16" :md="18" class="book-info-col">
          <div class="book-info">
            <h1 class="book-title">{{ book.title }}</h1>
            
            <div class="book-meta">
              <div class="meta-item">
                <span class="meta-label">作者：</span>
                <span class="meta-value">{{ book.author }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">分类：</span>
                <el-tag size="small">{{ getCategoryLabel(book.category) }}</el-tag>
              </div>
              <div class="meta-item" v-if="book.isbn">
                <span class="meta-label">ISBN：</span>
                <span class="meta-value">{{ book.isbn }}</span>
              </div>
              <div class="meta-item" v-if="book.publisher">
                <span class="meta-label">出版社：</span>
                <span class="meta-value">{{ book.publisher }}</span>
              </div>
              <div class="meta-item" v-if="book.publicationYear">
                <span class="meta-label">出版年份：</span>
                <span class="meta-value">{{ book.publicationYear }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">库存状态：</span>
                <el-tag :type="book.availableCopies > 0 ? 'success' : 'danger'" size="small">
                  剩余 {{ book.availableCopies }}/{{ book.totalCopies }} 本
                </el-tag>
              </div>
            </div>
            
            <div class="book-actions">
              <el-button 
                type="primary" 
                :disabled="!canBorrow || borrowLoading" 
                :loading="borrowLoading"
                @click="handleBorrow">
                借阅
              </el-button>
              <el-button @click="router.push('/books')">返回列表</el-button>
            </div>
            
            <div class="borrow-notice" v-if="!userStore.isLoggedIn">
              <el-alert
                title="请先登录才能借阅图书"
                type="info"
                :closable="false">
                <template #default>
                  <el-button type="primary" size="small" @click="router.push('/login')">
                    去登录
                  </el-button>
                </template>
              </el-alert>
            </div>
            
            <div class="borrow-notice" v-else-if="!canBorrow && book.availableCopies <= 0">
              <el-alert
                title="当前图书已全部借出，暂时无法借阅"
                type="warning"
                :closable="false">
              </el-alert>
            </div>
            
            <div class="borrow-notice" v-else-if="!canBorrow && activeBorrows >= 5">
              <el-alert
                title="您当前借阅数量已达上限(5本)，请归还后再借阅"
                type="warning"
                :closable="false">
              </el-alert>
            </div>
            
            <div class="book-description">
              <h3>图书简介</h3>
              <p>{{ book.description || '暂无简介' }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '@/store/book';
import { useUserStore } from '@/store/user';
import { useBorrowStore } from '@/store/borrow';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const userStore = useUserStore();
const borrowStore = useBorrowStore();

const loading = ref(true);
const borrowLoading = ref(false);
const activeBorrows = ref(0);
const bookId = computed(() => Number(route.params.id));

// 获取图书信息
const book = computed(() => bookStore.selectedBook);

// 分类标签映射
const categoryLabels = {
  'FICTION': '小说',
  'NON_FICTION': '非小说',
  'SCIENCE': '科学',
  'TECHNOLOGY': '技术',
  'HISTORY': '历史',
  'PHILOSOPHY': '哲学',
  'ART': '艺术',
  'BIOGRAPHY': '传记',
  'CHILDREN': '儿童',
  'OTHER': '其他'
};

// 根据分类代码获取分类标签
const getCategoryLabel = (category) => {
  return categoryLabels[category] || category;
};

// 是否可以借阅
const canBorrow = computed(() => {
  return userStore.isLoggedIn && book.value && book.value.availableCopies > 0 && activeBorrows.value < 5;
});

// 加载图书详情
const loadBookDetail = async () => {
  try {
    loading.value = true;
    await bookStore.fetchBookById(bookId.value);
    
    // 如果用户已登录，获取活跃借阅数量
    if (userStore.isLoggedIn) {
      await loadActiveBorrows();
    }
  } catch (error) {
    ElMessage.error('获取图书信息失败');
  } finally {
    loading.value = false;
  }
};

// 加载用户活跃借阅数量
const loadActiveBorrows = async () => {
  try {
    const response = await borrowStore.countActiveBorrowsByUserId(userStore.userId);
    activeBorrows.value = response;
  } catch (error) {
    console.error('获取活跃借阅数量失败', error);
  }
};

// 处理借阅
const handleBorrow = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要借阅《${book.value.title}》吗？`,
      '借阅确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    borrowLoading.value = true;
    await borrowStore.borrowBook(bookId.value);
    
    await loadBookDetail(); // 重新加载图书详情
    
    ElMessage.success('借阅申请提交成功，请等待管理员审核');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '借阅失败');
    }
  } finally {
    borrowLoading.value = false;
  }
};

onMounted(() => {
  loadBookDetail();
});
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.not-found {
  text-align: center;
  padding: 40px 0;
}

.book-image-col {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.book-image-container {
  max-width: 300px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.book-image {
  width: 100%;
  height: 400px;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background-color: #f5f7fa;
  color: #909399;
}

.book-info {
  padding: 0 20px;
}

.book-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.8rem;
  color: #303133;
}

.book-meta {
  margin-bottom: 20px;
}

.meta-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.meta-label {
  color: #909399;
  margin-right: 5px;
}

.meta-value {
  color: #606266;
}

.book-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.borrow-notice {
  margin-bottom: 20px;
}

.book-description {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.book-description h3 {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: bold;
}

.book-description p {
  line-height: 1.6;
  color: #606266;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .book-image-col, .book-info-col {
    width: 100%;
  }
  
  .book-info {
    padding: 0;
  }
}
</style> 
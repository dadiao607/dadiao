<template>
  <div class="home-container">
    <!-- 横幅区域 -->
    <div class="banner">
      <div class="banner-content">
        <h1>欢迎来到图书馆管理系统</h1>
        <p>探索知识的海洋，开启阅读的旅程</p>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图书..."
          class="search-input"
          @keyup.enter="handleSearch">
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-nav">
      <el-scrollbar>
        <div class="category-list">
          <el-button 
            :type="selectedCategory === '' ? 'primary' : 'default'"
            @click="selectCategory('')">
            全部
          </el-button>
          <el-button 
            v-for="category in bookStore.categories" 
            :key="category"
            :type="selectedCategory === category ? 'primary' : 'default'"
            @click="selectCategory(category)">
            {{ getCategoryLabel(category) }}
          </el-button>
        </div>
      </el-scrollbar>
    </div>

    <!-- 图书展示区域 -->
    <div class="books-section">
      <h2 class="section-title">{{ sectionTitle }}</h2>
      
      <el-empty v-if="loading" :image-size="200" description="加载中..."></el-empty>
      <el-empty v-else-if="displayBooks.length === 0" description="暂无图书"></el-empty>
      
      <el-row :gutter="20" v-else>
        <el-col v-for="book in displayBooks" :key="book.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-card class="book-card" :body-style="{ padding: '0px' }">
            <div class="book-img" @click="goToBookDetail(book.id)">
              <el-image 
                :src="book.imageUrl || 'https://via.placeholder.com/150x200?text=No+Cover'" 
                fit="cover">
                <template #error>
                  <div class="image-placeholder">
                    <el-icon size="40"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="book-info">
              <h3 class="book-title" @click="goToBookDetail(book.id)">{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
              <div class="book-meta">
                <span class="book-category">{{ getCategoryLabel(book.category) }}</span>
                <span class="book-available" :class="{ 'not-available': book.availableCopies === 0 }">
                  {{ book.availableCopies > 0 ? '可借阅' : '已借完' }}
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/store/book';
import { ElMessage } from 'element-plus';
import { Search, Picture } from '@element-plus/icons-vue';

const router = useRouter();
const bookStore = useBookStore();

const loading = ref(true);
const searchKeyword = ref('');
const selectedCategory = ref('');
const searchResults = ref([]);
const isSearchMode = ref(false);

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

// 标题
const sectionTitle = computed(() => {
  if (isSearchMode.value) {
    return `搜索"${searchKeyword.value}"的结果`;
  } else if (selectedCategory.value) {
    return `${getCategoryLabel(selectedCategory.value)}类图书`;
  } else {
    return '最新上架图书';
  }
});

// 显示的图书
const displayBooks = computed(() => {
  if (isSearchMode.value) {
    return searchResults.value;
  } else if (selectedCategory.value) {
    return bookStore.booksByCategory(selectedCategory.value);
  } else {
    return bookStore.books;
  }
});

// 选择分类
const selectCategory = async (category) => {
  selectedCategory.value = category;
  isSearchMode.value = false;
  
  try {
    loading.value = true;
    if (category) {
      await bookStore.fetchBooksByCategory(category);
    } else {
      await bookStore.fetchAllBooks();
    }
  } catch (error) {
    ElMessage.error('获取图书信息失败');
  } finally {
    loading.value = false;
  }
};

// 搜索图书
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    return;
  }
  
  try {
    loading.value = true;
    isSearchMode.value = true;
    selectedCategory.value = '';
    searchResults.value = await bookStore.searchBooks(searchKeyword.value);
  } catch (error) {
    ElMessage.error('搜索图书失败');
  } finally {
    loading.value = false;
  }
};

// 跳转到图书详情
const goToBookDetail = (bookId) => {
  router.push(`/books/${bookId}`);
};

// 加载初始数据
onMounted(async () => {
  try {
    await bookStore.fetchAllBooks();
  } catch (error) {
    ElMessage.error('获取图书信息失败');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-container {
  width: 100%;
}

.banner {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80');
  background-size: cover;
  background-position: center;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 30px;
}

.banner-content {
  text-align: center;
  max-width: 600px;
  padding: 0 20px;
}

.banner h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.banner p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.search-input {
  max-width: 500px;
  margin: 0 auto;
}

.category-nav {
  padding: 0 20px;
  margin-bottom: 30px;
}

.category-list {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.books-section {
  padding: 0 20px;
}

.section-title {
  margin-bottom: 20px;
  font-size: 1.5rem;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.book-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  height: 100%;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.book-img {
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.book-img .el-image {
  height: 100%;
  width: 100%;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.book-info {
  padding: 14px;
}

.book-title {
  font-size: 16px;
  margin: 0 0 8px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 44px;
}

.book-title:hover {
  color: #409EFF;
}

.book-author {
  color: #606266;
  font-size: 14px;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.book-category {
  background-color: #f0f2f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.book-available {
  color: #67c23a;
}

.not-available {
  color: #f56c6c;
}
</style> 
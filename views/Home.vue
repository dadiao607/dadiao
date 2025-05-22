<template>
  <div class="home-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到图书馆</h1>
        <p class="hero-subtitle">发现知识的殿堂，开启阅读的旅程</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="router.push('/books')">
            浏览图书
          </el-button>
          <el-button v-if="!isLoggedIn" size="large" @click="router.push('/register')">
            免费注册
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 统计信息区域 -->
    <div class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-icon"><el-icon><Reading /></el-icon></div>
          <div class="stat-value">{{ stats.totalBooks }}</div>
          <div class="stat-label">馆藏图书</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><el-icon><User /></el-icon></div>
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">注册读者</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon"><el-icon><Document /></el-icon></div>
          <div class="stat-value">{{ stats.totalBorrows }}</div>
          <div class="stat-label">累计借阅</div>
        </div>
      </div>
    </div>
    
    <!-- 热门图书区域 -->
    <div class="featured-section">
      <div class="section-header">
        <h2 class="section-title">热门图书</h2>
        <el-button type="primary" link @click="router.push('/books')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="featured-books">
        <div v-if="loading" class="loading-container">
          <el-skeleton :count="4" :loading="loading" animated>
            <template #template>
              <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <div v-for="i in 4" :key="i" style="width: 24%;">
                  <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
                  <div style="padding: 14px;">
                    <el-skeleton-item variant="h3" style="width: 50%;" />
                    <div style="display: flex; align-items: center; margin-top: 8px; height: 16px;">
                      <el-skeleton-item variant="text" style="margin-right: 16px;" />
                      <el-skeleton-item variant="text" style="width: 30%;" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
        
        <el-row :gutter="20" v-else>
          <el-col 
            v-for="book in featuredBooks" 
            :key="book.id" 
            :xs="12" 
            :sm="8" 
            :md="6" 
            :lg="6">
            <el-card 
              shadow="hover" 
              class="book-card" 
              @click="router.push(`/books/${book.id}`)">
              <div class="book-cover">
                <img 
                  :src="book.imageUrl || defaultCover" 
                  :alt="book.title" 
                  class="cover-image">
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-tags">
                  <el-tag size="small" type="info">{{ getCategoryLabel(book.category) }}</el-tag>
                  <el-tag 
                    size="small" 
                    :type="book.availableCopies > 0 ? 'success' : 'danger'">
                    {{ book.availableCopies > 0 ? '可借阅' : '已借完' }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 服务介绍区域 -->
    <div class="services-section">
      <h2 class="section-title centered">我们的服务</h2>
      
      <el-row :gutter="30">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="service-card">
            <div class="service-icon">
              <el-icon><Reading /></el-icon>
            </div>
            <h3 class="service-title">丰富馆藏</h3>
            <p class="service-desc">
              我们拥有丰富多样的图书资源，涵盖各类学科领域，满足不同读者的阅读需求。
            </p>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <div class="service-card">
            <div class="service-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <h3 class="service-title">在线借阅</h3>
            <p class="service-desc">
              便捷的在线借阅系统，让您足不出户即可享受图书资源，轻松管理您的借阅记录。
            </p>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8">
          <div class="service-card">
            <div class="service-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <h3 class="service-title">到期提醒</h3>
            <p class="service-desc">
              智能到期提醒系统，帮助您及时归还图书，避免逾期产生不必要的费用。
            </p>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 阅读推广 -->
    <div class="promotion-section">
      <div class="promotion-content">
        <h2 class="promotion-title">阅读，让生活更美好</h2>
        <p class="promotion-text">
          加入我们的图书馆，开启知识的大门，让阅读成为生活的一部分。
        </p>
        <el-button 
          type="primary" 
          size="large" 
          @click="scrollToTop">
          立即开始
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/store/book';
import { useAuthStore } from '@/store/auth';
import { ElMessage } from 'element-plus';
import { 
  Reading, 
  User, 
  Document, 
  Bell, 
  Monitor, 
  ArrowRight 
} from '@element-plus/icons-vue';

const router = useRouter();
const bookStore = useBookStore();
const authStore = useAuthStore();

// 默认封面图
const defaultCover = '/images/default-book-cover.jpg';

// 状态变量
const loading = ref(false);
const featuredBooks = ref([]);
const stats = ref({
  totalBooks: '5000+',
  totalUsers: '1000+',
  totalBorrows: '10000+'
});

// 计算属性：是否已登录
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

// 加载热门图书
const loadFeaturedBooks = async () => {
  try {
    loading.value = true;
    featuredBooks.value = await bookStore.fetchPopularBooks(8);
  } catch (error) {
    ElMessage.error('获取热门图书失败');
  } finally {
    loading.value = false;
  }
};

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 组件挂载时加载数据
onMounted(() => {
  loadFeaturedBooks();
});
</script>

<style scoped>
.home-container {
  width: 100%;
}

/* Hero Section */
.hero-section {
  height: 500px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
                     url('/images/library-bg.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 统计信息区域 */
.stats-section {
  background-color: #fff;
  padding: 40px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1rem;
  color: #909399;
}

/* 热门图书区域 */
.featured-section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.8rem;
  color: #303133;
  margin: 0;
}

.section-title.centered {
  text-align: center;
  margin-bottom: 40px;
}

.featured-books {
  margin-bottom: 30px;
}

.book-card {
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 200px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  padding: 15px;
}

.book-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 0 0 10px;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-tags {
  display: flex;
  gap: 8px;
}

/* 服务介绍区域 */
.services-section {
  background-color: #f5f7fa;
  padding: 60px 20px;
}

.service-card {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  margin-bottom: 30px;
  height: 100%;
}

.service-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 20px;
}

.service-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #303133;
}

.service-desc {
  color: #606266;
  line-height: 1.6;
}

/* 阅读推广 */
.promotion-section {
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                     url('/images/reading-bg.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.promotion-content {
  max-width: 700px;
  margin: 0 auto;
}

.promotion-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.promotion-text {
  font-size: 1.2rem;
  margin-bottom: 30px;
  font-weight: 300;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-item {
    width: 100%;
  }
  
  .promotion-title {
    font-size: 1.8rem;
  }
  
  .promotion-text {
    font-size: 1rem;
  }
}
</style> 
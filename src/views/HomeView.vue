<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieStore } from '@/stores/movie';
import { useAuthStore } from '@/stores/auth';
import MovieCard from '@/components/MovieCard.vue';
import { ElMessage } from 'element-plus';
import { Search, TrendCharts, Star } from '@element-plus/icons-vue';

const router = useRouter();
const movieStore = useMovieStore();
const authStore = useAuthStore();

const weeklyTrending = ref([]);
const dailyTrending = ref([]);
const loading = ref(false);
const bannerBackdrop = ref(null);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.currentUser?.username || '游客');
const userId = computed(() => authStore.currentUser?.id);

// 获取热门电影数据
const fetchTrendingMovies = async () => {
  loading.value = true;
  try {
    const [weeklyData, dailyData] = await Promise.all([
      movieStore.getWeeklyTrending(1),
      movieStore.getDailyTrending(1)
    ]);

    // 如果用户已登录，获取用户影单以便标记已收藏的电影
    if (isAuthenticated.value && userId.value) {
      await movieStore.getUserMovieList(userId.value);
    }

    weeklyTrending.value = weeklyData.slice(0, 6); // 只显示前6个
    dailyTrending.value = dailyData.slice(0, 6); // 只显示前6个
  } catch (error) {
    console.error('获取热门电影失败:', error);
  } finally {
    loading.value = false;
  }
};

// 导航到更多电影页面
const navigateTo = (path) => {
  router.push(path);
};

// 检查电影是否在用户的影单中
const isInUserList = (movieId) => {
  if (!isAuthenticated.value || !movieStore.userMovieList.length) return false;
  return movieStore.userMovieList.some(item => item.movieId.toString() === movieId.toString());
};

// 组件挂载时获取数据
onMounted(async () => {
  await fetchTrendingMovies();

  // 获取今日热门第一个电影的背景图
  if (dailyTrending.value.length > 0 && dailyTrending.value[0].id) {
    const details = await movieStore.getMovieDetails(dailyTrending.value[0].id);
    bannerBackdrop.value = `https://image.tmdb.org/t/p/original${details.backdropPath}`;
  }
});
</script>

<template>
  <main class="home-page">
    <!-- 欢迎横幅 -->
    <section class="welcome-banner" :style="bannerBackdrop ? { backgroundImage: `url(${bannerBackdrop})` } : {}">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <template v-if="!isAuthenticated">
          <h1>欢迎来到电影库</h1>
          <p>发现最新、最热门的电影资讯</p>
        </template>
        <template v-else>
          <h1>您好 {{ userName }}</h1>
          <h3>今天想看什么电影呢？</h3>
        </template>
      </div>
    </section>

    <!-- 本周热门 -->
    <section class="trending-section">
      <div class="section-header">
        <h2>本周热门</h2>
        <el-button link @click="navigateTo('/trending/week')">查看更多</el-button>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else class="movie-slider">
        <movie-card v-for="movie in weeklyTrending" :key="movie.id" :movie="movie" :is-in-list="isInUserList(movie.id)" />
      </div>
    </section>

    <!-- 今日热门 -->
    <section class=" trending-section">
          <div class="section-header">
            <h2>今日热门</h2>
            <el-button link @click="navigateTo('/trending/day')">查看更多</el-button>
          </div>

          <div v-if="loading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>

          <div v-else class="movie-slider">
            <movie-card v-for="movie in dailyTrending" :key="movie.id" :movie="movie" />
          </div>
    </section>

    <!-- 功能区块 -->
    <section class="features-section">
      <div class="feature-card" @click="navigateTo('/search')">
        <el-icon :size="40">
          <Search />
        </el-icon>
        <h3>搜索电影</h3>
        <p>查找您喜欢的电影</p>
      </div>

      <div class="feature-card" @click="navigateTo('/trending/week')">
        <el-icon :size="40">
          <TrendCharts />
        </el-icon>
        <h3>热门榜单</h3>
        <p>发现最受欢迎的电影</p>
      </div>

      <div class="feature-card" @click="isAuthenticated ? navigateTo('/movie-list') : navigateTo('/login')">
        <el-icon :size="40">
          <Star />
        </el-icon>
        <h3>我的影单</h3>
        <p>收藏您喜爱的电影</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.welcome-banner {
  margin: 20px 0 40px;
  padding: 60px 30px;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  background-size: cover;
  background-position: center;
  color: white;
  border-radius: 8px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.banner-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.trending-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.movie-slider {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin: 50px 0;
}

.feature-card {
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
  margin: 15px 0 10px;
  font-size: 1.2rem;
}

.feature-card p {
  color: #666;
}

.loading {
  padding: 20px;
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 40px 20px;
  }

  .banner-content h1 {
    font-size: 2rem;
  }

  .banner-actions {
    flex-direction: column;
    align-items: center;
  }

  .features-section {
    grid-template-columns: 1fr;
  }
}
</style>

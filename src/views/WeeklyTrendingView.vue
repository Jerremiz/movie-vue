<template>
  <div class="trending-page">
    <h1>本周热门电影</h1>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="20" animated />
    </div>

    <div v-else-if="error" class="error">
      <el-empty :description="error" :image-size="200">
        <el-button type="primary" @click="fetchTrending">重试</el-button>
      </el-empty>
    </div>

    <div v-else-if="movies.length === 0" class="empty-list">
      <el-empty description="暂无热门电影数据" :image-size="200">
        <el-button type="primary" @click="fetchTrending">刷新</el-button>
      </el-empty>
    </div>

    <div v-else class="trending-movies">
      <movie-card v-for="movie in movies" :key="movie.id" :movie="movie" :is-in-list="isInUserList(movie.id)" />
    </div>

    <div class="pagination">
      <el-pagination v-model:current-page="currentPage" :page-size="20" layout="prev, pager, next" :total="totalMovies"
        @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMovieStore } from '@/stores/movie';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import MovieCard from '@/components/MovieCard.vue';

const props = defineProps({
  page: {
    type: Number,
    default: 1
  }
});

const movieStore = useMovieStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// 从路由参数中获取页码，优先使用URL查询参数中的页码
const currentPage = ref(parseInt(route.query.page) || props.page);
const totalMovies = ref(500);
const loading = computed(() => movieStore.loading);
const error = computed(() => movieStore.error);
const movies = computed(() => movieStore.weeklyTrending || []);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userId = computed(() => authStore.currentUser?.id);

// 检查电影是否在用户的影单中
const isInUserList = (movieId) => {
  if (!isAuthenticated.value || !movieStore.userMovieList.length) return false;
  return movieStore.userMovieList.some(item => item.movieId.toString() === movieId.toString());
};

// 获取热门电影
const fetchTrending = async () => {
  try {
    await movieStore.getWeeklyTrending(currentPage.value);

    // 如果用户已登录，获取用户影单以便标记已收藏的电影
    if (isAuthenticated.value && userId.value) {
      await movieStore.getUserMovieList(userId.value);
    }
  } catch (error) {
    console.error('获取热门电影失败:', error);
  }
};

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page;
  // 更新URL查询参数，不触发路由跳转
  router.replace({
    query: { ...route.query, page }
  });
};

// 监听页码变化
watch(currentPage, () => {
  fetchTrending();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchTrending();
});
</script>

<style scoped>
.trending-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  font-size: 28px;
}

.loading,
.error,
.empty-list {
  padding: 40px 0;
  text-align: center;
}

.trending-movies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .trending-movies {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>

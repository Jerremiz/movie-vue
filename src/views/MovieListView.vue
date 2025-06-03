<template>
  <div class="movie-list-page">
    <h1>我的影单</h1>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="20" animated />
    </div>

    <div v-else-if="error" class="error">
      <el-empty :description="error" :image-size="200">
        <el-button type="primary" @click="fetchUserMovieList">重试</el-button>
      </el-empty>
    </div>

    <div v-else-if="movies.length === 0" class="empty-list">
      <el-empty description="您的影单还是空的" :image-size="200">
        <el-button type="primary" @click="goToTrending">去发现电影</el-button>
      </el-empty>
    </div>

    <div v-else class="movie-grid">
      <movie-card v-for="movie in movies" :key="movie.movieId" :movie="{ ...movie, id: movie.movieId }"
        :is-in-list="true" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMovieStore } from '@/stores/movie';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import MovieCard from '@/components/MovieCard.vue';

const router = useRouter();
const movieStore = useMovieStore();
const authStore = useAuthStore();

const loading = computed(() => movieStore.loading);
const error = computed(() => movieStore.error);
const movies = computed(() => movieStore.userMovieList);
const userId = computed(() => authStore.currentUser?.id);

// 获取用户的影单
const fetchUserMovieList = async () => {
  if (!userId.value) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    await movieStore.getUserMovieList(userId.value);
  } catch (error) {
    console.error('获取影单失败:', error);
  }
};

// 跳转到热门电影页面
const goToTrending = () => {
  router.push('/trending/week');
};

// 组件挂载时获取影单
onMounted(() => {
  fetchUserMovieList();
});
</script>

<style scoped>
.movie-list-page {
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

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
}

@media (max-width: 768px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>

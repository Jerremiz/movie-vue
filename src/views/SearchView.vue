<template>
  <div class="search-page">
    <h1>搜索电影</h1>

    <div class="search-form">
      <el-input v-model="searchQuery" placeholder="输入电影名称..." class="search-input" :prefix-icon="Search"
        @keyup.enter="performSearch">
        <template #append>
          <el-button :icon="Search" @click="performSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="20" animated />
    </div>

    <div v-else-if="searchPerformed && movies.length === 0" class="no-results">
      <el-empty description="未找到相关电影" :image-size="200" />
    </div>

    <div v-else-if="searchPerformed" class="search-results">
      <h2>搜索结果</h2>
      <div class="movie-grid">
        <movie-card v-for="movie in movies" :key="movie.id" :movie="movie" :is-in-list="isInUserList(movie.id)" />
      </div>
    </div>

    <div v-else class="search-tips">
      <el-empty description="输入关键词搜索电影" :image-size="200" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useMovieStore } from '@/stores/movie';
import { useAuthStore } from '@/stores/auth';
import MovieCard from '@/components/MovieCard.vue';
import { ElMessage } from 'element-plus';

const movieStore = useMovieStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const searchPerformed = ref(false);
const loading = computed(() => movieStore.loading);
const movies = ref([]);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userId = computed(() => authStore.currentUser?.id);

// 检查电影是否在用户的影单中
const isInUserList = (movieId) => {
  if (!isAuthenticated.value || !movieStore.userMovieList.length) return false;
  return movieStore.userMovieList.some(item => item.movieId.toString() === movieId.toString());
};

// 执行搜索
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  try {
    // 重置搜索结果
    movies.value = [];

    // 执行搜索
    const results = await movieStore.searchMovies(searchQuery.value.trim());
    movies.value = results;
    searchPerformed.value = true;    // 如果用户已登录，获取用户影单以便标记已收藏的电影
    if (isAuthenticated.value && userId.value) {
      await movieStore.getUserMovieList(userId.value);
    }
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请稍后重试');
  }
};
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  font-size: 28px;
}

.search-form {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  max-width: 600px;
}

.loading,
.no-results,
.search-tips {
  padding: 40px 0;
  text-align: center;
}

.search-results h2 {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 500;
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

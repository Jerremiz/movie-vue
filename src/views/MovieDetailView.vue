<template>
  <div class="movie-detail">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else-if="error" class="error">
      <el-empty description="获取电影详情失败" :image-size="200">
        <el-button type="primary" @click="fetchMovieDetails">重试</el-button>
      </el-empty>
    </div>

    <div v-else-if="movie" class="movie-content">
      <!-- 电影背景 -->
      <div class="backdrop" :style="backdropStyle"></div>

      <!-- 主要内容 -->
      <div class="content"> <!-- 返回按钮 -->
        <div class="back-button">
          <el-button @click="$router.go(-1)" type="primary" plain size="small" icon="ArrowLeft">返回</el-button>
        </div>

        <!-- 海报和基本信息 -->
        <div class="header">
          <div class="poster-container">
            <img v-if="movie.posterPath" :src="getPosterUrl(movie.posterPath)" alt="电影海报" class="poster" />
            <div v-else class="no-poster poster">暂无海报</div>
          </div>

          <div class="info">
            <h1 class="title">{{ movie.title }}</h1>

            <div class="meta">
              <span v-if="movie.releaseDate" class="release-date">{{ formatDate(movie.releaseDate) }}</span>
              <span v-if="movie.imdbRating !== 'N/A'" class="rating">
                IMDb评分：<strong>{{ movie.imdbRating }}</strong> ({{ movie.imdbVotes }} votes)
              </span>
              <span v-if="movie.budget !== 'N/A'" class="budget">
                预算：{{ formatMoney(movie.budget) }}
              </span>
              <span v-if="movie.boxOffice !== 'N/A'" class="box-office">
                票房：{{ formatMoney(movie.boxOffice) }}
              </span>
            </div>

            <div class="actions">
              <el-button v-if="isUserLoggedIn && !isInList" type="primary" @click="addToList">
                <el-icon>
                  <Plus />
                </el-icon> 添加到影单
              </el-button>
              <el-button v-else-if="isUserLoggedIn && isInList" type="danger" @click="removeFromList">
                <el-icon>
                  <Delete />
                </el-icon> 从影单移除
              </el-button>
            </div>

            <div class="overview">
              <h3>剧情简介</h3>
              <p>{{ movie.overview }}</p>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <comment-section :movie-id="movieId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMovieStore } from '@/stores/movie';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import CommentSection from '@/components/CommentSection.vue';

const route = useRoute();
const router = useRouter();
const movieStore = useMovieStore();
const authStore = useAuthStore();

const movieId = computed(() => route.params.id);
const movie = computed(() => movieStore.currentMovie);
const loading = computed(() => movieStore.loading);
const error = computed(() => movieStore.error);
const isUserLoggedIn = computed(() => authStore.isAuthenticated);
const isInList = ref(false);

// 获取电影详情
const fetchMovieDetails = async () => {
  try {
    await movieStore.getMovieDetails(movieId.value);

    // 如果用户已登录，检查电影是否在用户影单中
    if (isUserLoggedIn.value) {
      checkIfMovieInList();
    }
  } catch (error) {
    console.error('获取电影详情失败:', error);
  }
};

// 检查电影是否在用户影单中
const checkIfMovieInList = async () => {
  try {
    const userId = authStore.currentUser.id;
    const userMovieList = await movieStore.getUserMovieList(userId);
    isInList.value = userMovieList.some(item => item.movieId.toString() === movieId.value.toString());
  } catch (error) {
    console.error('获取影单失败:', error);
  }
};

// 添加到影单
const addToList = async () => {
  try {
    const userId = authStore.currentUser.id;
    await movieStore.addToMovieList(userId, movieId.value);
    isInList.value = true;
    ElMessage.success('已添加到影单');
  } catch (error) {
    ElMessage.error('添加失败');
    console.error('添加到影单失败:', error);
  }
};

// 从影单移除
const removeFromList = async () => {
  try {
    const userId = authStore.currentUser.id;
    await movieStore.removeFromMovieList(userId, movieId.value);
    isInList.value = false;
    ElMessage.success('已从影单移除');
  } catch (error) {
    ElMessage.error('移除失败');
    console.error('从影单移除失败:', error);
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// 格式化金额
const formatMoney = (value) => {
  if (!value || value === 'N/A') return 'N/A';
  const num = parseInt(value, 10);
  if (isNaN(num)) return 'N/A';

  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
};

// 构建海报URL
const getPosterUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w500${path}`;
};

// 背景样式
const backdropStyle = computed(() => {
  if (!movie.value.backdropPath) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }

  let backdropUrl = movie.value.backdropPath;
  backdropUrl = `https://image.tmdb.org/t/p/original${backdropUrl}`;
  return {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${backdropUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
});

// 监听路由参数变化，重新获取电影详情
watch(movieId, () => {
  fetchMovieDetails();
});

// 组件挂载时获取电影详情
onMounted(() => {
  fetchMovieDetails();
});
</script>

<style scoped>
.movie-detail {
  position: relative;
  min-height: calc(100vh - 64px);
}

.back-button {
  margin-bottom: 15px;
  position: relative;
  z-index: 2;
}

.loading,
.error {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 500px;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.header {
  display: flex;
  margin-bottom: 40px;
  padding-top: 20px;
}

.poster-container {
  flex: 0 0 300px;
  margin-right: 30px;
}

.poster {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.no-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ecf0f1;
  font-size: 1rem;
  text-align: center;
  height: 100%;
}

.info {
  flex: 1;
  color: white;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.meta span {
  margin-right: 20px;
  font-size: 1rem;
}

.actions {
  margin-bottom: 30px;
}

.overview {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.overview h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.overview p {
  line-height: 1.6;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .poster-container {
    margin-right: 0;
    margin-bottom: 20px;
    max-width: 250px;
  }
}
</style>

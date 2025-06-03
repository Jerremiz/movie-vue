<template>
  <div class="netflix-card" @click="viewMovieDetails" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <div class="poster-wrapper" :class="{ 'is-hovering': hovering }">
      <img v-if="movie.posterPath" :src="getPosterUrl(movie.posterPath)" alt="电影海报" class="poster" />
      <div v-else class="no-poster poster">暂无海报</div>
      <div v-if="movie.rank" class="rank-badge">#{{ movie.rank }}</div>

      <!-- 悬停时显示的内容 -->
      <div v-if="hovering" class="hover-content">
        <div class="movie-title">{{ movie.title }}</div>
        <div class="action-buttons">
          <template v-if="isUserLoggedIn && showActions">
            <el-tooltip content="添加到影单" placement="top" v-if="!isInList">
              <el-button circle size="small" @click.stop="addToList">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="从影单移除" placement="top" v-else>
              <el-button circle size="small" type="danger" @click.stop="removeFromList">
                <el-icon>
                  <Remove />
                </el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </div>
      </div>
    </div>
    <div class="info-bar">
      <h4 class="title" :title="movie.title">{{ movie.title }}</h4>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useMovieStore } from '@/stores/movie';
import { ElMessage } from 'element-plus';
import { VideoPlay, Plus, Remove } from '@element-plus/icons-vue';

// 定义组件属性
const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  isInList: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const movieStore = useMovieStore();
const hovering = ref(false);

// 计算用户是否登录
const isUserLoggedIn = computed(() => authStore.isAuthenticated);

// 构建海报URL
const getPosterUrl = (path) => {
  if (path.startsWith('http')) {
    return path;
  }
  return `https://image.tmdb.org/t/p/w500${path}`;
};

// 查看电影详情
const viewMovieDetails = () => {
  // 简单地导航到电影详情页，不需要传递额外的来源信息
  // Vue Router 会自动处理浏览器历史记录
  router.push({
    name: 'movie-detail',
    params: { id: props.movie.id || props.movie.movieId }
  });
};

// 添加到影单
const addToList = async (event) => {
  event.stopPropagation();
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }

  try {
    const userId = authStore.currentUser.id;
    const movieId = props.movie.id || props.movie.movieId;
    await movieStore.addToMovieList(userId, movieId);
    ElMessage.success('已添加到影单');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '添加失败');
  }
};

// 从影单中移除
const removeFromList = async (event) => {
  event.stopPropagation();
  if (!authStore.isAuthenticated) {
    return;
  }

  try {
    const userId = authStore.currentUser.id;
    const movieId = props.movie.id || props.movie.movieId;
    await movieStore.removeFromMovieList(userId, movieId);
    ElMessage.success('已从影单移除');
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '移除失败');
  }
};
</script>

<style scoped>
.netflix-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin: 0.25rem;
  /* background: #141414; */
}

.poster-wrapper {
  position: relative;
  width: 100%;
  padding-top: 150%;
  /* 2:3 aspect ratio */
  overflow: hidden;
  border-radius: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.poster-wrapper.is-hovering {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}

.poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.no-poster {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
  color: #ecf0f1;
  font-size: 1rem;
  text-align: center;
}

.poster-wrapper.is-hovering .poster {
  filter: brightness(0.6);
}

.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(229, 9, 20, 0.9);
  /* Netflix 红色 */
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  z-index: 2;
}

.hover-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%);
  color: white;
  opacity: 1;
  z-index: 2;
}

.movie-title {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 10px;
  margin-left: 10px;
  margin-right: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin: 10px 0px;
  margin-right: 30px;
  justify-content: flex-end;
}

.info-bar {
  padding: 8px 5px;
  text-align: center;
}

.info-bar .title {
  font-size: 0.9rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
}

/* 响应式调整 */
@media (min-width: 768px) {
  .poster-wrapper:not(.is-hovering)+.info-bar {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .poster-wrapper.is-hovering+.info-bar {
    opacity: 0;
  }
}

/* 在小屏幕上始终显示信息 */
@media (max-width: 767px) {
  .poster-wrapper.is-hovering {
    transform: scale(1.02);
  }
}
</style>

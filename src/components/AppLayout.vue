<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">
            <img src="@/assets/logo.png" alt="电影库" class="logo-image" />
            <router-link to="/">电影库</router-link>
          </div>
          <div class="menu">
            <router-link to="/trending/week">周榜</router-link>
            <router-link to="/trending/day">日榜</router-link>
            <router-link to="/search">搜索</router-link>
          </div>
          <div class="user-actions">
            <template v-if="authStore.isAuthenticated">
              <router-link to="/movie-list">
                <el-button link>我的影单</el-button>
              </router-link>
              <el-tooltip content="个人资料" placement="bottom" :effect="'light'">
                <router-link to="/profile">
                  <el-avatar v-if="authStore.currentUser?.avatarUrl" :src="getImageUrl(authStore.currentUser.avatarUrl)"
                    size="small" />
                  <el-avatar v-else size="small">{{ getInitials() }}</el-avatar>
                </router-link>
              </el-tooltip>
              <el-button link @click="handleLogout">退出</el-button>
            </template>
            <template v-else>
              <router-link to="/login">
                <el-button type="primary">登录</el-button>
              </router-link>
              <router-link to="/register">
                <el-button>注册</el-button>
              </router-link>
            </template>
          </div>
        </div>
      </el-header>
      <el-main>
        <slot></slot>
      </el-main>
      <el-footer>
        <div class="footer-content">
          <p>&copy; 2025 电影库 - 热门电影 & 观影体验</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const router = useRouter();

// 获取用户头像地址
const getImageUrl = (url) => {
  // 如果路径包含 http 则直接返回
  if (url && url.startsWith('http')) {
    return url;
  }
  // 否则拼接基础 URL
  return `https://mondaydb.top${url}`;
};

// 获取用户名首字母
const getInitials = () => {
  const username = authStore.currentUser?.username || '';
  return username.charAt(0).toUpperCase();
};

// 处理登出
const handleLogout = () => {
  authStore.logout();
  ElMessage.success('已成功退出登录');
  router.push('/');
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-container {
  min-height: 100vh;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 75%;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-image {
  height: 32px;
  width: auto;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409EFF;
  text-decoration: none;
}

.menu {
  display: flex;
  gap: 15px;
}

.menu a {
  text-decoration: none;
  color: #606266;
  font-size: 1rem;
  padding: 5px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.menu a.router-link-active,
.menu a:hover {
  color: #409EFF;
  border-color: #409EFF;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-main {
  padding: 20px;
  flex: 1;
}

.el-footer {
  background-color: #f5f7fa;
  padding: 20px;
  height: 80px;
}

.footer-content {
  text-align: center;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

@media (max-width: 1300px) {
  .header-content {
    width: 80%;
  }
}

@media (max-width: 1024px) {
  .header-content {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .header-content {
    width: 100%;
  }
}
</style>

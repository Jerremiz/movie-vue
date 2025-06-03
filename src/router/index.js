import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置且返回前一页面，则使用保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/movie/:id',
      name: 'movie-detail',
      component: () => import('../views/MovieDetailView.vue'),
      props: true,
    },
    {
      path: '/trending/week',
      name: 'weekly-trending',
      component: () => import('../views/WeeklyTrendingView.vue'),
    },
    {
      path: '/trending/day',
      name: 'daily-trending',
      component: () => import('../views/DailyTrendingView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/movie-list',
      name: 'movie-list',
      component: () => import('../views/MovieListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 需要认证的页面
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    if (!authStore.isAuthenticated) {
      // 未登录则跳转到登录页面
      next({
        path: '/login',
        query: { redirect: to.fullPath }, // 登录后跳回原来的页面
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

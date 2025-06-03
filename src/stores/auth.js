import { defineStore } from 'pinia'
import { userApi } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await userApi.login(username, password)
        const { user, token } = response.data

        this.user = user
        this.token = token

        // 存储在本地存储中
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', token)

        return user
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await userApi.register(userData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    async uploadAvatar(userId, file) {
      this.loading = true
      try {
        const response = await userApi.uploadAvatar(userId, file)

        // 更新用户头像
        if (this.user && this.user.id === userId) {
          this.user.avatarUrl = response.data.avatarUrl
          localStorage.setItem('user', JSON.stringify(this.user))
        }

        return response.data
      } catch (error) {
        this.error = '上传头像失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新用户头像
    updateUserAvatar(avatarUrl) {
      if (this.user) {
        this.user.avatarUrl = avatarUrl
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    },
  },
})

import { defineStore } from 'pinia'
import { movieApi, movieListApi } from '@/services/api'

export const useMovieStore = defineStore('movie', {
  state: () => ({
    weeklyTrending: [],
    dailyTrending: [],
    currentMovie: null,
    userMovieList: [],
    loading: false,
    error: null,
  }),
  actions: {
    async getWeeklyTrending(page = 1) {
      this.loading = true
      try {
        const response = await movieApi.getWeeklyTrending(page)
        this.weeklyTrending = response.data
        return response.data
      } catch (error) {
        this.error = '获取周榜失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getDailyTrending(page = 1) {
      this.loading = true
      try {
        const response = await movieApi.getDailyTrending(page)
        this.dailyTrending = response.data
        return response.data
      } catch (error) {
        this.error = '获取日榜失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    async getMovieDetails(movieId) {
      this.loading = true
      try {
        const response = await movieApi.getMovieDetails(movieId)
        this.currentMovie = response.data
        return response.data
      } catch (error) {
        this.error = '获取电影详情失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUpdateAllMovies() {
      this.loading = true
      try {
        const response = await movieApi.fetchAllMovies()
        return response.data
      } catch (error) {
        this.error = '更新榜单失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async searchMovies(query) {
      this.loading = true
      try {
        const response = await movieApi.searchMovies(query)
        return response.data
      } catch (error) {
        this.error = '搜索电影失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    async getUserMovieList(userId) {
      this.loading = true
      try {
        const response = await movieListApi.getList(userId)
        this.userMovieList = response.data
        return response.data
      } catch (error) {
        this.error = '获取影单失败'
        throw error
      } finally {
        this.loading = false
      }
    },
    async addToMovieList(userId, movieId) {
      try {
        const response = await movieListApi.addToList(userId, movieId)
        // 更新本地用户影单数据，但不设置加载状态
        const movieListResponse = await movieListApi.getList(userId)
        this.userMovieList = movieListResponse.data
        return response.data
      } catch (error) {
        this.error = '添加到影单失败'
        throw error
      }
    },
    async removeFromMovieList(userId, movieId) {
      try {
        const response = await movieListApi.removeFromList(userId, movieId)
        // 更新本地用户影单数据，但不设置加载状态
        const movieListResponse = await movieListApi.getList(userId)
        this.userMovieList = movieListResponse.data
        return response.data
      } catch (error) {
        this.error = '从影单中删除失败'
        throw error
      }
    },
  },
})

import { defineStore } from 'pinia'
import { commentApi } from '@/services/api'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    movieComments: [],
    userComments: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchMovieComments(movieId) {
      this.loading = true
      try {
        const response = await commentApi.getMovieComments(movieId)
        this.movieComments = response.data
        return response.data
      } catch (error) {
        this.error = '获取电影评论失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserComments(userId) {
      this.loading = true
      try {
        const response = await commentApi.getUserComments(userId)
        this.userComments = response.data
        return response.data
      } catch (error) {
        this.error = '获取用户评论失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async addComment(userId, movieId, comment) {
      this.loading = true
      try {
        const response = await commentApi.addComment(userId, movieId, comment)
        // 刷新电影评论
        await this.fetchMovieComments(movieId)
        return response.data
      } catch (error) {
        this.error = '添加评论失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteComment(userId, commentId, movieId) {
      this.loading = true
      try {
        const response = await commentApi.deleteComment(userId, commentId)

        // 如果提供了电影ID，刷新电影的评论
        if (movieId) {
          await this.fetchMovieComments(movieId)
        }

        // 刷新用户的评论
        await this.fetchUserComments(userId)

        return response.data
      } catch (error) {
        this.error = '删除评论失败'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})

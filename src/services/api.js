import axios from 'axios'

const API_URL = 'https://mondaydb.top'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 电影相关API
export const movieApi = {
  // 获取周榜
  getWeeklyTrending: (page = 1) => {
    return apiClient.get(`/movies/trending/week/${page}`)
  },

  // 获取日榜
  getDailyTrending: (page = 1) => {
    return apiClient.get(`/movies/trending/day/${page}`)
  },

  // 获取电影详情
  getMovieDetails: (movieId) => {
    return apiClient.post(`/movies/more/${movieId}`)
  },

  // 更新榜单
  fetchAllMovies: () => {
    return apiClient.post('/movies/fetch-all')
  },
  // 搜索电影
  searchMovies: (query) => {
    return apiClient.get(`/movies/search?query=${encodeURIComponent(query)}`)
  },
}

// 用户相关API
export const userApi = {
  // 用户注册
  register: (userData) => {
    return apiClient.post('/users/register', userData)
  },

  // 用户登录
  login: (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    return apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  // 获取用户信息
  getUserInfo: (userId) => {
    return apiClient.get(`/users/get?userId=${userId}`)
  },

  // 上传头像
  uploadAvatar: (userId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    return apiClient.post('/users/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// 影单相关API
export const movieListApi = {
  // 添加影单
  addToList: (userId, movieId) => {
    return apiClient.post(`/movieList/add?userId=${userId}&movieId=${movieId}`)
  },

  // 删除影单
  removeFromList: (userId, movieId) => {
    return apiClient.delete(`/movieList/delete?userId=${userId}&movieId=${movieId}`)
  },

  // 获取影单
  getList: (userId) => {
    return apiClient.get(`/movieList/getList?userId=${userId}`)
  },
}

// 评论相关API
export const commentApi = {
  // 添加评论
  addComment: (userId, movieId, comment) => {
    return apiClient.post(`/comments/add?userId=${userId}`, {
      userId,
      movieId,
      comment,
    })
  },

  // 获取电影评论
  getMovieComments: (movieId) => {
    return apiClient.get(`/comments/movie/${movieId}`)
  },

  // 获取用户评论
  getUserComments: (userId) => {
    return apiClient.get(`/comments/user/${userId}`)
  },

  // 删除评论
  deleteComment: (userId, commentId) => {
    return apiClient.delete(`/comments/delete?userId=${userId}&commentId=${commentId}`)
  },
}

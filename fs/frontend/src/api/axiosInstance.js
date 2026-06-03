import axios from 'axios'
import { API_BASE_URL, API_PREFIX, TOKEN_KEY } from '@/utils/constants'

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  withCredentials: true, // kirim HttpOnly cookie (refresh_token) ke backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — inject Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
// Refresh token dikelola backend via HttpOnly cookie secara otomatis.
// Saat access token expired (401), coba panggil /auth/refresh sekali.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Backend menggunakan cookie HttpOnly untuk refresh token
        const response = await axios.post(
          `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const { accessToken } = response.data.data
        localStorage.setItem(TOKEN_KEY, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosInstance(originalRequest)
      } catch {
        // Refresh gagal — hapus token & redirect ke login
        localStorage.removeItem(TOKEN_KEY)
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance

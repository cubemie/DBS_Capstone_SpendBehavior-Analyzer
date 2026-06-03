import axiosInstance from './axiosInstance'

export const authApi = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
  refreshToken: (refreshToken) => axiosInstance.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
}

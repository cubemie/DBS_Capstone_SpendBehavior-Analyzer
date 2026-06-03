import axiosInstance from './axiosInstance'

export const userApi = {
  getMe: () => axiosInstance.get('/users/me'),
  updateMe: (data) => axiosInstance.put('/users/me', data),
  changePassword: (data) => axiosInstance.put('/users/me/password', data),
  deleteMe: () => axiosInstance.delete('/users/me'),
}

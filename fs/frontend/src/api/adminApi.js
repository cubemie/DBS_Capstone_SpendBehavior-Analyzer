import axiosInstance from './axiosInstance'

export const adminApi = {
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getUserById: (id) => axiosInstance.get(`/admin/users/${id}`),
  updateUserStatus: (id, is_active) => axiosInstance.put(`/admin/users/${id}/status`, { is_active }),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  getOverview: () => axiosInstance.get('/admin/reports/overview'),
}

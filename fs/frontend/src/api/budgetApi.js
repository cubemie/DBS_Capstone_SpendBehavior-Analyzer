import axiosInstance from './axiosInstance'

export const budgetApi = {
  getList: (params) => axiosInstance.get('/budgets', { params }),
  create: (data) => axiosInstance.post('/budgets', data),
  update: (id, data) => axiosInstance.put(`/budgets/${id}`, data),
  delete: (id) => axiosInstance.delete(`/budgets/${id}`),
}

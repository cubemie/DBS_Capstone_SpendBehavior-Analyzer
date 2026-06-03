import axiosInstance from './axiosInstance'

export const transactionApi = {
  getList: (params) => axiosInstance.get('/transactions', { params }),
  getById: (id) => axiosInstance.get(`/transactions/${id}`),
  create: (data) => axiosInstance.post('/transactions', data),
  update: (id, data) => axiosInstance.patch(`/transactions/${id}`, data),
  delete: (id) => axiosInstance.delete(`/transactions/${id}`),
  bulkDelete: (ids) => axiosInstance.delete('/transactions', { data: { ids } }),
}

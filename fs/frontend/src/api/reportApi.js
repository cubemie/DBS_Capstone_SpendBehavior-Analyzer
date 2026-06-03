import axiosInstance from './axiosInstance'

export const reportApi = {
  getSummary: (params) => axiosInstance.get('/reports/summary', { params }),
  getByCategory: (params) => axiosInstance.get('/reports/by-category', { params }),
  getMonthlyTrend: (params) => axiosInstance.get('/reports/monthly-trend', { params }),
  getDailyTrend: (params) => axiosInstance.get('/reports/daily-trend', { params }),
  export: (params) =>
    axiosInstance.get('/reports/export', {
      params,
      responseType: 'blob',
    }),
}

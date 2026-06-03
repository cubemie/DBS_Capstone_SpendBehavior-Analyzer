export const APP_NAME = import.meta.env.VITE_APP_NAME || 'BUDU'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
export const API_PREFIX = '/api/v1'

export const TOKEN_KEY = 'budu_token'
export const REFRESH_TOKEN_KEY = 'budu_refresh_token'
export const THEME_KEY = 'budu_theme'

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
}

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

export const DEFAULT_CATEGORIES = [
  { name: 'Makanan & Minuman', icon: 'utensils', color: '#f59e0b', type: 'expense' },
  { name: 'Transportasi', icon: 'car', color: '#3b82f6', type: 'expense' },
  { name: 'Belanja', icon: 'shopping-bag', color: '#8b5cf6', type: 'expense' },
  { name: 'Tagihan & Utilitas', icon: 'zap', color: '#ef4444', type: 'expense' },
  { name: 'Hiburan', icon: 'tv', color: '#ec4899', type: 'expense' },
  { name: 'Kesehatan', icon: 'heart', color: '#10b981', type: 'expense' },
  { name: 'Pendidikan', icon: 'book', color: '#06b6d4', type: 'expense' },
  { name: 'Gaji', icon: 'briefcase', color: '#10b981', type: 'income' },
  { name: 'Freelance', icon: 'laptop', color: '#6366f1', type: 'income' },
  { name: 'Investasi', icon: 'trending-up', color: '#14b8a6', type: 'income' },
  { name: 'Lainnya', icon: 'more-horizontal', color: '#6b7280', type: 'both' },
]

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Terbaru' },
  { value: 'date_asc', label: 'Terlama' },
  { value: 'amount_desc', label: 'Nominal Terbesar' },
  { value: 'amount_asc', label: 'Nominal Terkecil' },
]

export const PAGE_SIZES = [10, 20, 50, 100]

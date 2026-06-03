import { TOKEN_KEY } from '@/utils/constants'

// Refresh token dikelola backend via HttpOnly cookie — tidak disimpan di localStorage
export const tokenService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  setTokens: (accessToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY)
  },

  hasToken: () => !!localStorage.getItem(TOKEN_KEY),
}

import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { tokenService } from './tokenService'

export const authService = {
  async login(credentials) {
    const response = await authApi.login(credentials)
    // Backend mengembalikan accessToken (camelCase)
    const { accessToken } = response.data.data
    tokenService.setTokens(accessToken)
    return response.data.data
  },

  async register(data) {
    const response = await authApi.register(data)
    // Setelah register, backend langsung buat session
    const { accessToken } = response.data.data
    tokenService.setTokens(accessToken)
    return response.data.data
  },

  async logout() {
    try {
      await authApi.logout()
    } catch {
      // swallow error — selalu clear tokens
    } finally {
      tokenService.clearTokens()
    }
  },

  async getMe() {
    const response = await userApi.getMe()
    return response.data.data
  },

  async forgotPassword(email) {
    const response = await authApi.forgotPassword(email)
    return response.data
  },

  async resetPassword(data) {
    const response = await authApi.resetPassword(data)
    return response.data
  },
}

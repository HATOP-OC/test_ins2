import { apiClient } from './client'
import type { User } from '@/lib/store/auth'

interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password })
    return response.data
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', { name, email, password })
    return response.data
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/auth/me')
    return response.data
  },
}

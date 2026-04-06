import api from './api';
import type { User } from '@/types';

export const authApi = {
  getProfile: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  getGoogleAuthUrl: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    return `${apiUrl}/auth/google`;
  },

  devLogin: async () => {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/dev-login');
    return res.data;
  },
};

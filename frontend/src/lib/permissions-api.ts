import api from './api';
import type { Permission, ShareLink, User, PermissionEntry } from '@/types';

export const permissionsApi = {
  getForResource: async (resourceType: 'file' | 'folder', resourceId: string) => {
    const res = await api.get<Permission[]>(`/permissions/${resourceType}/${resourceId}`);
    return res.data;
  },

  grant: async (data: { resourceType: 'file' | 'folder'; resourceId: string; entries: PermissionEntry[] }) => {
    const res = await api.post<Permission[]>('/permissions', data);
    return res.data;
  },

  revoke: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/permissions/${id}`);
    return res.data;
  },

  searchUsers: async (email: string) => {
    const res = await api.get<User[]>(`/users/search?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  createShareLink: async (data: { resourceType: 'file' | 'folder'; resourceId: string }) => {
    const res = await api.post<ShareLink>('/share-links', data);
    return res.data;
  },

  getShareLink: async (resourceType: 'file' | 'folder', resourceId: string) => {
    const res = await api.get<ShareLink | null>(`/share-links/${resourceType}/${resourceId}`);
    return res.data;
  },

  getSharedResource: async (token: string) => {
    const res = await api.get<{ shareLink: ShareLink; resource: any }>(`/share-links/token/${token}`);
    return res.data;
  },

  deleteShareLink: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/share-links/${id}`);
    return res.data;
  },
};

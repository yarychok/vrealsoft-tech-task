import api from './api';
import type { Folder, FolderContents, Breadcrumb } from '@/types';

export const foldersApi = {
  getRootContents: async () => {
    const res = await api.get<FolderContents>('/folders');
    return res.data;
  },

  getFolderContents: async (id: string) => {
    const res = await api.get<FolderContents>(`/folders/${id}`);
    return res.data;
  },

  create: async (data: { name: string; parentId?: string; isPublic?: boolean }) => {
    const res = await api.post<Folder>('/folders', data);
    return res.data;
  },

  update: async (id: string, data: { name?: string; parentId?: string | null; isPublic?: boolean; position?: number }) => {
    const res = await api.patch<Folder>(`/folders/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/folders/${id}`);
    return res.data;
  },

  clone: async (id: string) => {
    const res = await api.post<Folder>(`/folders/${id}/clone`);
    return res.data;
  },

  getBreadcrumbs: async (id: string) => {
    const res = await api.get<Breadcrumb[]>(`/folders/${id}/breadcrumbs`);
    return res.data;
  },

  reorder: async (items: { id: string; position: number }[]) => {
    const res = await api.patch<{ message: string }>('/folders/reorder/batch', { items });
    return res.data;
  },
};

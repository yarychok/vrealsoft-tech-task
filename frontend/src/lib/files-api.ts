import api from './api';
import type { FileItem } from '@/types';

export const filesApi = {
  upload: async (file: File, folderId?: string, isPublic: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    formData.append('isPublic', String(isPublic));

    const res = await api.post<FileItem>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getFile: async (id: string) => {
    const res = await api.get<FileItem>(`/files/${id}`);
    return res.data;
  },

  getDownloadUrl: (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const url = new URL(`${base}/files/${id}/download`);
    if (token) url.searchParams.set('token', token);
    return url.toString();
  },

  update: async (id: string, data: { name?: string; folderId?: string | null; isPublic?: boolean; position?: number }) => {
    const res = await api.patch<FileItem>(`/files/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/files/${id}`);
    return res.data;
  },

  clone: async (id: string) => {
    const res = await api.post<FileItem>(`/files/${id}/clone`);
    return res.data;
  },

  reorder: async (items: { id: string; position: number }[]) => {
    const res = await api.patch<{ message: string }>('/files/reorder/batch', { items });
    return res.data;
  },
};

import { create } from 'zustand';
import type { Folder, FileItem, Breadcrumb, FolderContents } from '@/types';
import { foldersApi } from '@/lib/folders-api';
import { filesApi } from '@/lib/files-api';

interface FilesState {
  folders: Folder[];
  files: FileItem[];
  sharedFolders: Folder[];
  sharedFiles: FileItem[];
  currentFolder: Folder | null;
  userPermission: 'owner' | 'editor' | 'viewer' | null;
  breadcrumbs: Breadcrumb[];
  isLoading: boolean;
  error: string | null;

  loadRootContents: () => Promise<void>;
  loadFolderContents: (folderId: string) => Promise<void>;
  loadBreadcrumbs: (folderId: string) => Promise<void>;
  createFolder: (data: { name: string; parentId?: string; isPublic?: boolean }) => Promise<Folder>;
  updateFolder: (id: string, data: { name?: string; isPublic?: boolean }) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  cloneFolder: (id: string) => Promise<void>;
  uploadFile: (file: File, folderId?: string, isPublic?: boolean) => Promise<FileItem>;
  updateFile: (id: string, data: { name?: string; isPublic?: boolean }) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  cloneFile: (id: string) => Promise<void>;
  reorderFolders: (items: { id: string; position: number }[]) => Promise<void>;
  reorderFiles: (items: { id: string; position: number }[]) => Promise<void>;
  clearError: () => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  folders: [],
  files: [],
  sharedFolders: [],
  sharedFiles: [],
  currentFolder: null,
  userPermission: null,
  breadcrumbs: [],
  isLoading: false,
  error: null,

  loadRootContents: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await foldersApi.getRootContents();
      set({
        folders: data.folders || [],
        files: data.files || [],
        sharedFolders: data.sharedFolders || [],
        sharedFiles: data.sharedFiles || [],
        currentFolder: null,
        userPermission: null,
        breadcrumbs: [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load contents', isLoading: false });
    }
  },

  loadFolderContents: async (folderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await foldersApi.getFolderContents(folderId);
      set({
        currentFolder: data.folder || null,
        folders: data.children || [],
        files: data.files || [],
        sharedFolders: [],
        sharedFiles: [],
        userPermission: data.userPermission || null,
        isLoading: false,
      });
      get().loadBreadcrumbs(folderId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load folder', isLoading: false });
    }
  },

  loadBreadcrumbs: async (folderId: string) => {
    try {
      const breadcrumbs = await foldersApi.getBreadcrumbs(folderId);
      set({ breadcrumbs });
    } catch {
      set({ breadcrumbs: [] });
    }
  },

  createFolder: async (data) => {
    const folder = await foldersApi.create(data);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
    return folder;
  },

  updateFolder: async (id, data) => {
    await foldersApi.update(id, data);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  deleteFolder: async (id) => {
    await foldersApi.remove(id);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  cloneFolder: async (id) => {
    await foldersApi.clone(id);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  uploadFile: async (file, folderId, isPublic) => {
    const uploaded = await filesApi.upload(file, folderId, isPublic);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
    return uploaded;
  },

  updateFile: async (id, data) => {
    await filesApi.update(id, data);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  deleteFile: async (id) => {
    await filesApi.remove(id);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  cloneFile: async (id) => {
    await filesApi.clone(id);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  reorderFolders: async (items) => {
    await foldersApi.reorder(items);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  reorderFiles: async (items) => {
    await filesApi.reorder(items);
    const { currentFolder } = get();
    if (currentFolder) {
      get().loadFolderContents(currentFolder.id);
    } else {
      get().loadRootContents();
    }
  },

  clearError: () => set({ error: null }),
}));

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  owner?: User;
  isPublic: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  permission?: 'editor' | 'viewer';
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  folderId: string | null;
  ownerId: string;
  owner?: User;
  isPublic: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  permission?: 'editor' | 'viewer';
}

export interface Permission {
  id: string;
  resourceType: 'file' | 'folder';
  resourceId: string;
  userId: string;
  user?: User;
  grantedById: string;
  grantedBy?: User;
  permission: 'editor' | 'viewer';
  createdAt: string;
}

export interface ShareLink {
  id: string;
  resourceType: 'file' | 'folder';
  resourceId: string;
  token: string;
  createdById: string;
  createdAt: string;
  expiresAt?: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export interface FolderContents {
  folders?: Folder[];
  files?: FileItem[];
  sharedFolders?: Folder[];
  sharedFiles?: FileItem[];
  folder?: Folder;
  children?: Folder[];
  userPermission?: 'owner' | 'editor' | 'viewer';
}

export interface SearchResults {
  folders: Folder[];
  files: FileItem[];
  permissionMap?: Record<string, 'editor' | 'viewer'>;
}

export interface PermissionEntry {
  email: string;
  permission: 'editor' | 'viewer';
}

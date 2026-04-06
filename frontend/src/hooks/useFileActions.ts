import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useFilesStore } from '@/stores/files.store';
import { useUIStore } from '@/stores/ui.store';
import type { Folder, FileItem } from '@/types';

export function useFileActions() {
  const router = useRouter();
  const { deleteFolder, cloneFolder, deleteFile, cloneFile, reorderFolders, reorderFiles, folders, files } = useFilesStore();
  const { showConfirm } = useUIStore();

  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPublic, setEditPublic] = useState(false);

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setEditName(folder.name);
    setEditPublic(folder.isPublic);
  };

  const handleEditFile = (file: FileItem) => {
    setEditingFile(file);
    setEditName(file.name);
    setEditPublic(file.isPublic);
  };

  const handleSaveEdit = async () => {
    try {
      if (editingFolder) {
        await useFilesStore.getState().updateFolder(editingFolder.id, {
          name: editName,
          isPublic: editPublic,
        });
        toast.success('Folder updated');
      } else if (editingFile) {
        await useFilesStore.getState().updateFile(editingFile.id, {
          name: editName,
          isPublic: editPublic,
        });
        toast.success('File updated');
      }
      setEditingFolder(null);
      setEditingFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCancelEdit = () => {
    setEditingFolder(null);
    setEditingFile(null);
  };

  const handleDeleteFolder = (folder: Folder) => {
    showConfirm(
      'Delete folder',
      `Are you sure you want to delete this folder "${folder.name}"? This will also delete all files and subfolders inside it.`,
      async () => {
        try {
          await deleteFolder(folder.id);
          toast.success('Folder deleted');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Delete failed');
        }
      },
    );
  };

  const handleDeleteFile = (file: FileItem) => {
    showConfirm(
      'Delete file',
      `Are you sure you want to delete this file "${file.name}"?`,
      async () => {
        try {
          await deleteFile(file.id);
          toast.success('File deleted');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Delete failed');
        }
      },
    );
  };

  const handleCloneFolder = async (folder: Folder) => {
    try {
      await cloneFolder(folder.id);
      toast.success('Folder duplicated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Clone failed');
    }
  };

  const handleCloneFile = async (file: FileItem) => {
    try {
      await cloneFile(file.id);
      toast.success('File duplicated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Clone failed');
    }
  };

  const handleShareFolder = (folder: Folder) => {
    router.push(`/permissions/folder/${folder.id}`);
  };

  const handleShareFile = (file: FileItem) => {
    router.push(`/permissions/file/${file.id}`);
  };

  const handleMoveFolderUp = async (folder: Folder) => {
    const idx = folders.findIndex((f) => f.id === folder.id);
    if (idx <= 0) return;
    const prev = folders[idx - 1];
    try {
      await reorderFolders([
        { id: folder.id, position: idx - 1 },
        { id: prev.id, position: idx },
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reorder failed');
    }
  };

  const handleMoveFolderDown = async (folder: Folder) => {
    const idx = folders.findIndex((f) => f.id === folder.id);
    if (idx < 0 || idx >= folders.length - 1) return;
    const next = folders[idx + 1];
    try {
      await reorderFolders([
        { id: folder.id, position: idx + 1 },
        { id: next.id, position: idx },
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reorder failed');
    }
  };

  const handleMoveFileUp = async (file: FileItem) => {
    const idx = files.findIndex((f) => f.id === file.id);
    if (idx <= 0) return;
    const prev = files[idx - 1];
    try {
      await reorderFiles([
        { id: file.id, position: idx - 1 },
        { id: prev.id, position: idx },
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reorder failed');
    }
  };

  const handleMoveFileDown = async (file: FileItem) => {
    const idx = files.findIndex((f) => f.id === file.id);
    if (idx < 0 || idx >= files.length - 1) return;
    const next = files[idx + 1];
    try {
      await reorderFiles([
        { id: file.id, position: idx + 1 },
        { id: next.id, position: idx },
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reorder failed');
    }
  };

  return {
    editingFolder,
    editingFile,
    editName,
    setEditName,
    editPublic,
    setEditPublic,
    handleEditFolder,
    handleEditFile,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteFolder,
    handleDeleteFile,
    handleCloneFolder,
    handleCloneFile,
    handleShareFolder,
    handleShareFile,
    handleMoveFolderUp,
    handleMoveFolderDown,
    handleMoveFileUp,
    handleMoveFileDown,
  };
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, Plus } from 'lucide-react';
import { useFilesStore } from '@/stores/files.store';
import { Button } from '@/components/ui/button';
import Breadcrumbs from '@/components/Breadcrumbs';
import FolderCard from '@/components/FolderCard';
import FileCard from '@/components/FileCard';
import SearchBar from '@/components/SearchBar';
import EditModal from '@/components/EditModal';
import { useFileActions } from '@/hooks/useFileActions';

export default function DashboardPage() {
  const router = useRouter();
  const {
    folders,
    files,
    sharedFolders,
    breadcrumbs,
    isLoading,
    loadRootContents,
  } = useFilesStore();

  const {
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
  } = useFileActions();

  useEffect(() => {
    loadRootContents();
  }, [loadRootContents]);

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            onClick={() => router.push('/folders/new')}
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
          <Button onClick={() => router.push('/upload')}>
            <Plus className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {(editingFolder || editingFile) && (
        <EditModal
          type={editingFolder ? 'Folder' : 'File'}
          name={editName}
          onNameChange={setEditName}
          isPublic={editPublic}
          onPublicChange={setEditPublic}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div>
          {folders.length === 0 && files.length === 0 && sharedFolders.length === 0 && (
            <div className="text-center py-16">
              <FolderPlus className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <h2 className="mt-4 text-lg font-medium text-foreground">No files yet</h2>
              <p className="mt-2 text-muted-foreground">Upload files or create a folder to get started.</p>
            </div>
          )}

          {folders.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Folders
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {folders.map((folder, idx) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onEdit={handleEditFolder}
                    onDelete={handleDeleteFolder}
                    onClone={handleCloneFolder}
                    onShare={handleShareFolder}
                    onMoveUp={handleMoveFolderUp}
                    onMoveDown={handleMoveFolderDown}
                    isFirst={idx === 0}
                    isLast={idx === folders.length - 1}
                  />
                ))}
              </div>
            </section>
          )}

          {sharedFolders.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Shared with me
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {sharedFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onEdit={handleEditFolder}
                    onDelete={handleDeleteFolder}
                    onClone={handleCloneFolder}
                    onShare={handleShareFolder}
                  />
                ))}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Files
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {files.map((file, idx) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onEdit={handleEditFile}
                    onDelete={handleDeleteFile}
                    onClone={handleCloneFile}
                    onShare={handleShareFile}
                    onMoveUp={handleMoveFileUp}
                    onMoveDown={handleMoveFileDown}
                    isFirst={idx === 0}
                    isLast={idx === files.length - 1}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

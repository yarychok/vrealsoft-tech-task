'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import FolderCard from '@/components/FolderCard';
import FileCard from '@/components/FileCard';
import { searchApi } from '@/lib/search-api';
import { useFileActions } from '@/hooks/useFileActions';
import EditModal from '@/components/EditModal';
import { Folder, FileItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
  } = useFileActions();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await searchApi.search(query.trim());
      setFolders(res?.folders || []);
      setFiles(res?.files || []);
    } catch {
      setFolders([]);
      setFiles([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) { handleSearch(); }
  }, []);

  const total = folders.length + files.length;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders..."
            autoFocus
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>

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

      {isSearching && (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      )}

      {!isSearching && hasSearched && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {total} result{total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>

          {folders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Folders</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {folders.map((f) => (
                  <FolderCard key={f.id} folder={f} onEdit={handleEditFolder} onDelete={handleDeleteFolder} onClone={handleCloneFolder} onShare={handleShareFolder} />
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">Files</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((f) => (
                  <FileCard key={f.id} file={f} onEdit={handleEditFile} onDelete={handleDeleteFile} onClone={handleCloneFile} onShare={handleShareFile} />
                ))}
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No results found.</p>
            </div>
          )}
        </>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Enter a query to search for files and folders.</p>
        </div>
      )}
    </div>
  );
}

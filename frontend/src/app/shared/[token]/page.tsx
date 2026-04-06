'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Folder as FolderIcon, FileText, Download } from 'lucide-react';
import { permissionsApi } from '@/lib/permissions-api';
import { filesApi } from '@/lib/files-api';
import { Folder, FileItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SharedPage() {
  const params = useParams();
  const token = params.token as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resourceType, setResourceType] = useState<'file' | 'folder' | null>(null);
  const [file, setFile] = useState<FileItem | null>(null);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await permissionsApi.getSharedResource(token);
        const data = res?.resource;
        if (data?.file) {
          setResourceType('file');
          setFile(data.file);
        } else if (data?.folder) {
          setResourceType('folder');
          setFolder(data.folder);
          setFiles(data.files || []);
          setFolders(data.children || []);
        }
      } catch {
        setError('This link is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleDownload = (fileId: string) => {
    const url = filesApi.getDownloadUrl(fileId);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="text-center max-w-md">
          <CardContent className="pt-6">
            <h1 className="text-xl font-semibold text-foreground mb-2">Link Unavailable</h1>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-1">Shared via link</p>
          {resourceType === 'file' && file ? (
            <h1 className="text-2xl font-bold text-foreground">{file.originalName}</h1>
          ) : folder ? (
            <h1 className="text-2xl font-bold text-foreground">{folder.name}</h1>
          ) : null}
        </div>

        {resourceType === 'file' && file && (
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{file.originalName}</p>
                  <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
                </div>
              </div>
              <Button onClick={() => handleDownload(file.id)}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </CardContent>
          </Card>
        )}

        {resourceType === 'folder' && (
          <div className="space-y-3">
            {folders.map((f) => (
              <Card key={f.id}>
                <CardContent className="pt-6 flex items-center gap-3">
                  <FolderIcon className="h-6 w-6 text-yellow-500" />
                  <span className="font-medium text-foreground">{f.name}</span>
                </CardContent>
              </Card>
            ))}
            {files.map((f) => (
              <Card key={f.id}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{f.originalName}</p>
                      <p className="text-sm text-muted-foreground">{formatSize(f.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(f.id)}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Download
                  </button>
                </CardContent>
              </Card>
            ))}
            {folders.length === 0 && files.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">This folder is empty.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

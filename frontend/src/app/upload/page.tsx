'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import FileUploadArea from '@/components/FileUploadArea';
import { useFilesStore } from '@/stores/files.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('folderId') || undefined;
  const { uploadFile } = useFilesStore();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadFile(file, folderId, isPublic);
      }
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      router.back();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Upload Files
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
        <FileUploadArea onFilesSelected={handleFilesSelected} isUploading={isUploading} />

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Selected files ({selectedFiles.length})
            </h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-sm text-destructive hover:text-destructive/80 ml-2 shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
            />
            <Label htmlFor="isPublic">
              Make files public (accessible to anyone with the link)
            </Label>
          </div>
        </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={isUploading || selectedFiles.length === 0}>
          {isUploading ? 'Uploading...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export default function FileUploadArea({ onFilesSelected, isUploading }: FileUploadAreaProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <>
            <FileUp className="h-12 w-12 text-primary" />
            <p className="text-lg font-medium text-primary">Drop files here</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Drag & drop files here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse from your computer
              </p>
            </div>
            <Button className="mt-2" disabled={isUploading}>
              Choose Files
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

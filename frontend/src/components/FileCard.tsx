'use client';

import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Share2,
  Download,
  Globe,
  Lock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { FileItem } from '@/types';
import { filesApi } from '@/lib/files-api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileCardProps {
  file: FileItem;
  onEdit: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onClone: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onMoveUp?: (file: FileItem) => void;
  onMoveDown?: (file: FileItem) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="h-10 w-10 text-green-500" />;
  if (mimeType.startsWith('video/')) return <Film className="h-10 w-10 text-purple-500" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-10 w-10 text-pink-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar'))
    return <Archive className="h-10 w-10 text-orange-500" />;
  return <FileText className="h-10 w-10 text-blue-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FileCard({
  file,
  onEdit,
  onDelete,
  onClone,
  onShare,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: FileCardProps) {
  const handleDownload = () => {
    const url = filesApi.getDownloadUrl(file.id);
    window.open(url, '_blank');
  };

  return (
    <Card className="group hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate">{file.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              {file.isPublic ? (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {onMoveUp && !isFirst && (
              <DropdownMenuItem onClick={() => onMoveUp(file)}>
                <ArrowUp className="h-4 w-4 mr-2" /> Move Up
              </DropdownMenuItem>
            )}
            {onMoveDown && !isLast && (
              <DropdownMenuItem onClick={() => onMoveDown(file)}>
                <ArrowDown className="h-4 w-4 mr-2" /> Move Down
              </DropdownMenuItem>
            )}
            {(onMoveUp || onMoveDown) && (!isFirst || !isLast) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(file)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onClone(file)}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(file)}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(file)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

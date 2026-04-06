'use client';

import Link from 'next/link';
import {
  Folder as FolderIcon,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Share2,
  Globe,
  Lock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { Folder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderCardProps {
  folder: Folder;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folder: Folder) => void;
  onClone?: (folder: Folder) => void;
  onShare?: (folder: Folder) => void;
  onMoveUp?: (folder: Folder) => void;
  onMoveDown?: (folder: Folder) => void;
  isFirst?: boolean;
  isLast?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showShare?: boolean;
}

export default function FolderCard({
  folder,
  onEdit,
  onDelete,
  onClone,
  onShare,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  showEdit = false,
  showDelete = false,
  showShare = false,
}: FolderCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between">
        <Link
          href={`/dashboard/folders/${folder.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="shrink-0">
            <FolderIcon className="h-10 w-10 text-yellow-500 fill-yellow-100" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate">{folder.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {folder.isPublic ? (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Private
                </span>
              )}
              {folder.owner && (
                <span className="truncate">{folder.owner.name}</span>
              )}
            </div>
          </div>
        </Link>

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
              <DropdownMenuItem onClick={() => onMoveUp(folder)}>
                <ArrowUp className="h-4 w-4 mr-2" /> Move Up
              </DropdownMenuItem>
            )}
            {onMoveDown && !isLast && (
              <DropdownMenuItem onClick={() => onMoveDown(folder)}>
                <ArrowDown className="h-4 w-4 mr-2" /> Move Down
              </DropdownMenuItem>
            )}
            {(onMoveUp || onMoveDown) && (!isFirst || !isLast) && <DropdownMenuSeparator />}
            {showEdit && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(folder)}>
                <Edit className="h-4 w-4 mr-2" /> Rename
              </DropdownMenuItem>
            )}
            {onClone && (
              <DropdownMenuItem onClick={() => onClone(folder)}>
                <Copy className="h-4 w-4 mr-2" /> Duplicate
              </DropdownMenuItem>
            )}
            {showShare && onShare && (
              <DropdownMenuItem onClick={() => onShare(folder)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </DropdownMenuItem>
            )}
            {showDelete && onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(folder)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

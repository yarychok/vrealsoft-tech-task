'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useFilesStore } from '@/stores/files.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function NewFolderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId') || undefined;
  const { createFolder } = useFilesStore();

  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFolder({ name: name.trim(), parentId });
      toast.success('Folder created');
      router.back();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        New Folder
      </h1>

      <Card>
        <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Folder name</Label>
            <Input
              id="name"
              type="text"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Folder"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}

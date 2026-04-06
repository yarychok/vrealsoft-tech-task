'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Shield, Trash2, Plus } from 'lucide-react';
import { permissionsApi } from '@/lib/permissions-api';
import { Permission } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PermissionsPage() {
  const params = useParams();
  const resourceType = params.type as 'file' | 'folder';
  const resourceId = params.id as string;

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState<'viewer' | 'editor'>('viewer');
  const [entries, setEntries] = useState<{ email: string; permission: 'viewer' | 'editor' }[]>([]);
  const [isGranting, setIsGranting] = useState(false);

  const load = async () => {
    try {
      const res = await permissionsApi.getForResource(resourceType, resourceId);
      setPermissions(res || []);
    } catch {
      toast.error('Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [resourceType, resourceId]);

  const addEntry = () => {
    if (!email.trim()) {
      toast.error('Enter an email address');
      return;
    }
    if (entries.some((e) => e.email === email.trim())) {
      toast.error('Email already added');
      return;
    }
    setEntries((prev) => [...prev, { email: email.trim(), permission: access }]);
    setEmail('');
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGrant = async () => {
    if (entries.length === 0) {
      toast.error('Add at least one user');
      return;
    }

    setIsGranting(true);
    try {
      await permissionsApi.grant({
        resourceType,
        resourceId,
        entries,
      });
      toast.success('Permissions granted');
      setEntries([]);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to grant permissions');
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    try {
      await permissionsApi.revoke(permissionId);
      toast.success('Permission revoked');
      setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
    } catch {
      toast.error('Failed to revoke permission');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6" />
        Manage Permissions
      </h1>
      <p className="text-sm text-muted-foreground mb-6 capitalize">
        {resourceType}: {resourceId}
      </p>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Share access</h2>

          <div className="flex gap-2 mb-4">
            <Input
              type="email"
              className="flex-1"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEntry())}
            />
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-32"
              value={access}
              onChange={(e) => setAccess(e.target.value as 'viewer' | 'editor')}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <Button variant="outline" onClick={addEntry}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {entries.length > 0 && (
            <div className="mb-4 space-y-2">
              {entries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">
                    {entry.email} — <span className="font-medium capitalize">{entry.permission}</span>
                  </span>
                  <button onClick={() => removeEntry(index)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button onClick={handleGrant} className="w-full mt-2" disabled={isGranting}>
                {isGranting ? 'Granting...' : 'Grant Permissions'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current permissions</h2>

          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permissions granted yet.</p>
          ) : (
            <ul className="space-y-2">
              {permissions.map((p) => (
                <li key={p.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {p.user?.name || p.user?.email || 'Unknown user'}
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {p.permission}
                    </Badge>
                  </div>
                  <button onClick={() => handleRevoke(p.id)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { HardDrive, Search, Upload, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <HardDrive className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">VRealSoft</span>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">My Files</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/search" className="flex items-center gap-1">
                    <Search className="h-4 w-4" />
                    Search
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/upload" className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Link>
                </Button>
              </nav>
            )}
          </div>

          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

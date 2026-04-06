'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import type { Breadcrumb } from '@/types';

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground py-3 px-1 overflow-x-auto">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-primary transition-colors shrink-0"
      >
        <Home className="h-4 w-4" />
        <span>My Files</span>
      </Link>

      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.name}</span>
          ) : (
            <Link
              href={`/dashboard/folders/${item.id}`}
              className="hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

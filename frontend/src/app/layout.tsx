import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ConfirmDialog from '@/components/ConfirmDialog';

export const metadata: Metadata = {
  title: 'VRealSoft - File Storage',
  description: 'A simple file storage service with permissions management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <ConfirmDialog />
        </AuthGuard>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

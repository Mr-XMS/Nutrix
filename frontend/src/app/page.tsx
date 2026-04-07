'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(isAuthenticated ? '/dashboard' : '/auth/login');
  }, [hydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="size-5 animate-spin text-ink-300" />
    </div>
  );
}

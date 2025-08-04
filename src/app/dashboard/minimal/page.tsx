'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MinimalDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual minimal dashboard
    router.replace('/finetuning/dashboard/minimal');
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Redirecting to minimal dashboard...</p>
      </div>
    </div>
  );
}

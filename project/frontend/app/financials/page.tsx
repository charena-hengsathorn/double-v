'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinancialsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/financials');
  }, [router]);

  return null;
}

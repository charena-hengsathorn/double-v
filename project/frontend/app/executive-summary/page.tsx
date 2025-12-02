'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExecutiveSummaryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/executive-summary');
  }, [router]);

  return null;
}

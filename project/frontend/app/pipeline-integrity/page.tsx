'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PipelineIntegrityRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/pipeline-integrity');
  }, [router]);

  return null;
}

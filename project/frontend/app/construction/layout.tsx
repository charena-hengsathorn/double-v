'use client';

import ProtectedRoute from '../../app-shell/components/ProtectedRoute';

export default function ConstructionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}


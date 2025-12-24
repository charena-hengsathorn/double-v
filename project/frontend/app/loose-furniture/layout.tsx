'use client';

import ProtectedRoute from '../../app-shell/components/ProtectedRoute';

export default function LooseFurnitureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}


'use client';

import ProtectedRoute from '../../app-shell/components/ProtectedRoute';

export default function CashflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}






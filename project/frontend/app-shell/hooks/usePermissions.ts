'use client';

import { useAuth } from '../context/AuthContext';

/**
 * Hook to check user permissions based on role
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Check if user has a specific role
   */
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.role?.name === roleName;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user) return false;
    return roleNames.includes(user.role?.name || '');
  };

  /**
   * Check if user can perform bulk delete operations
   * Only admins, finance, and exec roles can bulk delete
   */
  const canBulkDelete = (): boolean => {
    if (!user) return false;
    const allowedRoles = ['admin', 'Administrator', 'finance', 'Finance', 'exec', 'Executive'];
    return allowedRoles.includes(user.role?.name || '');
  };

  /**
   * Check if user can edit entries
   */
  const canEdit = (): boolean => {
    if (!user) return false;
    // All authenticated users can edit
    return !!user;
  };

  /**
   * Check if user can create entries
   */
  const canCreate = (): boolean => {
    if (!user) return false;
    // All authenticated users can create
    return !!user;
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    canBulkDelete,
    canEdit,
    canCreate,
    isAuthenticated: !!user,
  };
}


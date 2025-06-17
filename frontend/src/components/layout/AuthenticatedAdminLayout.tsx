import React from 'react';
import AdminLayout, { AdminLayoutProps } from './AdminLayout';
import ProtectedRoute from '../auth/ProtectedRoute';

interface AuthenticatedAdminLayoutProps extends AdminLayoutProps {
  requiredRoles?: string[];
  children: React.ReactNode;
}

/**
 * A wrapper around AdminLayout that includes authentication protection
 */
export default function AuthenticatedAdminLayout({
  requiredRoles = ['superadmin'],
  children,
  ...props
}: AuthenticatedAdminLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={requiredRoles} isAdminRoute={true}>
      <AdminLayout {...props}>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
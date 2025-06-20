import React from 'react';
import AdminLayout, { AdminLayoutProps } from './AdminLayout';
import ProtectedRoute from '../auth/ProtectedRoute';

interface AuthenticatedAdminLayoutProps extends AdminLayoutProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

/**
 * A wrapper around AdminLayout that includes authentication protection
 */
export default function AuthenticatedAdminLayout({
  allowedRoles = ['superadmin'],
  children,
  ...props
}: AuthenticatedAdminLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles} isAdminRoute={true}>
      <AdminLayout {...props}>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}
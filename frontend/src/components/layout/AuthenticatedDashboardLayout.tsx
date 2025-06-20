import React from 'react';
import DashboardLayout, { DashboardLayoutProps } from './DashboardLayout';
import ProtectedRoute from '../auth/ProtectedRoute';

interface AuthenticatedDashboardLayoutProps extends DashboardLayoutProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

/**
 * A wrapper around DashboardLayout that includes authentication protection
 */
export default function AuthenticatedDashboardLayout({
  allowedRoles,
  children,
  ...props
}: AuthenticatedDashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout {...props}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
import React from 'react';
import DashboardLayout, { DashboardLayoutProps } from './DashboardLayout';
import ProtectedRoute from '../auth/ProtectedRoute';

interface AuthenticatedDashboardLayoutProps extends DashboardLayoutProps {
  requiredRoles?: string[];
  children: React.ReactNode;
}

/**
 * A wrapper around DashboardLayout that includes authentication protection
 */
export default function AuthenticatedDashboardLayout({
  requiredRoles,
  children,
  ...props
}: AuthenticatedDashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <DashboardLayout {...props}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
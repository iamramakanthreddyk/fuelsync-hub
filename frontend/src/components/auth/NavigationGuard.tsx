import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../utils/auth';

interface NavigationGuardProps {
  children: React.ReactNode;
}

/**
 * A component that handles navigation based on authentication status
 * - Redirects authenticated users from login/register pages to dashboard
 * - Allows access to public routes
 */
export default function NavigationGuard({ children }: NavigationGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;
    
    // If user is authenticated and trying to access login or register page
    if (user && (router.pathname === '/login' || router.pathname === '/register')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);
  
  // Don't block rendering while checking auth status
  return <>{children}</>;
}
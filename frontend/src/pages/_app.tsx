// frontend/src/pages/_app.tsx
import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { isTokenExpired } from '../utils/authHelper';
import { AuthProvider, useAuth } from '../context/AuthProvider';
import '../styles/globals.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { token, logout } = useAuth();

  useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }

    // Check authentication on route change
    const handleRouteChange = (url: string) => {
      // Skip auth check for public pages
      const publicRoutes = process.env.NODE_ENV === 'production'
        ? ['/login', '/admin/login']
        : ['/login', '/debug', '/admin/login'];
      if (publicRoutes.includes(url)) {
        return;
      }

      // Handle admin routes separately
      if (url.startsWith('/admin')) {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          console.log('Admin not authenticated, redirecting to admin login...');
          router.push('/admin/login');
          return;
        }
        return;
      }

      // Check if token is expired for regular user routes
      if (token && isTokenExpired()) {
        console.log('Token expired, redirecting to login...');
        logout();
        router.push('/login');
        return;
      }

      if (!token) {
        console.log('User not authenticated, redirecting to login...');
        router.push('/login');
      }
    };

    // Initial auth check
    handleRouteChange(router.pathname);

    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up event listener
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, token]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <AppContent {...props} />
    </AuthProvider>
  );
}

export default MyApp;
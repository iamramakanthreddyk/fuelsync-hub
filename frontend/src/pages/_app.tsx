// frontend/src/pages/_app.tsx
import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../context/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  const { user, logout } = useAuth();

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

      if (url.startsWith('/admin')) {
        if (!user || user.role !== 'superadmin') {
          console.log('Admin not authenticated, redirecting to admin login...');
          router.push('/admin/login');
          return;
        }
        return;
      }

      if (!user) {
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
  }, [router]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

const queryClient = new QueryClient();

function MyApp(props: AppProps) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent {...props} />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default MyApp;
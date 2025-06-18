// frontend/src/pages/_app.tsx
import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useRouter } from 'next/router';
import { isAuthenticated, isTokenExpired } from '../utils/authHelper';
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

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }

    // Check authentication on route change
    const handleRouteChange = (url: string) => {
      // Skip auth check for login and debug pages
      if (url === '/login' || url === '/debug') {
        return;
      }

      // Check if token is expired
      if (isAuthenticated() && isTokenExpired()) {
        console.log('Token expired, redirecting to login...');
        router.push('/login');
        return;
      }

      // Check if user is authenticated for protected routes
      if (!isAuthenticated() && !url.startsWith('/login')) {
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
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
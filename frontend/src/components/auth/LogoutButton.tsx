// frontend/src/components/auth/LogoutButton.tsx
import React from 'react';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';
import { removeToken } from '../../utils/authHelper';
import { LogoutOutlined } from '@mui/icons-material';

interface LogoutButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'error';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'text',
  color = 'inherit',
  size = 'medium',
  showIcon = true
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove token from localStorage
      removeToken();
      
      console.log('Logout successful, redirecting to login page');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API call fails, remove token and redirect
      removeToken();
      router.push('/login');
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      onClick={handleLogout}
      startIcon={showIcon ? <LogoutOutlined /> : null}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
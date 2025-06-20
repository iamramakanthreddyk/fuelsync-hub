// frontend/src/pages/dashboard/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { getUserRole, getToken, authHeader } from '../../utils/authHelper';
import { apiFetch } from '../../services/api';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const headers = authHeader();
        if (!headers.Authorization) {
          setError('Authentication required');
          setLoading(false);
          router.push('/login');
          return;
        }
        
        console.log('Using headers:', headers);
        
        const response = await apiFetch('/dashboard', {
          headers,
        });
        
        const data = await response.json();
        console.log('Dashboard data:', data);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Authentication error:', data);
            router.push('/login');
            return;
          }
          throw new Error(data.message || 'Failed to fetch dashboard data');
        }
        
        if (data) {
          setDashboardData(data);
        } else {
          console.error('Invalid dashboard data format:', data);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'}
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                  }}
                >
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Today's Sales
                  </Typography>
                  <Typography component="p" variant="h4">
                    {dashboardData?.todaySales?.total || '$0.00'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    {dashboardData?.todaySales?.count || 0} transactions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                  }}
                >
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Fuel Volume
                  </Typography>
                  <Typography component="p" variant="h4">
                    {dashboardData?.fuelVolume?.total || '0'} L
                  </Typography>
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    Today's total volume
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                  }}
                >
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Credit Sales
                  </Typography>
                  <Typography component="p" variant="h4">
                    {dashboardData?.creditSales?.total || '$0.00'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                    {dashboardData?.creditSales?.count || 0} credit transactions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Recent Activity
                  </Typography>
                  {dashboardData?.recentActivity?.length > 0 ? (
                    <Box>
                      {dashboardData.recentActivity.map((activity) => (
                        <Box key={activity.id} sx={{ mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                          <Typography variant="body2">
                            <strong>{activity.type}:</strong> {activity.details} - {activity.amount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent activity to display.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
// frontend/src/pages/admin/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import AdminLayout from '@/components/layout/AdminLayout';
import { Business, SupervisorAccount, Storage } from '@mui/icons-material';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({
    tenantCount: 0,
    userCount: 0,
    stationCount: 0,
    recentTenants: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<Business color="primary" />}
              title="Total Tenants"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.tenantCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<SupervisorAccount color="primary" />}
              title="Total Users"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.userCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<Storage color="primary" />}
              title="Total Stations"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.stationCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tenants */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tenants
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {stats.recentTenants && stats.recentTenants.length > 0 ? (
              <List>
                {stats.recentTenants.map((tenant: any) => (
                  <ListItem
                    key={tenant.id}
                    divider
                    button
                    onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
                  >
                    <ListItemText
                      primary={tenant.name}
                      secondary={`${tenant.subscription_plan} plan • Created: ${new Date(tenant.created_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No tenants found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
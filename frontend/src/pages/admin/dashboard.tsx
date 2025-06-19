// frontend/src/pages/admin/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Business, SupervisorAccount, Storage } from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    tenantCount: 0,
    userCount: 0,
    stationCount: 0,
    recentTenants: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Fetch admin info
        const adminResponse = await fetch('http://localhost:3001/api/admin-auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!adminResponse.ok) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
          router.push('/admin/login');
          return;
        }

        const adminData = await adminResponse.json();
        setAdmin(adminData.data);

        // Fetch dashboard stats
        const statsResponse = await fetch('http://localhost:3001/api/superadmin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data || {
            tenantCount: 0,
            userCount: 0,
            stationCount: 0,
            recentTenants: []
          });
        }

        // If stats endpoint fails, fetch tenants to get count
        else {
          const tenantsResponse = await fetch('http://localhost:3001/api/superadmin/tenants', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (tenantsResponse.ok) {
            const tenantsData = await tenantsResponse.json();
            const tenants = tenantsData.data || [];
            
            setStats({
              tenantCount: tenants.length,
              userCount: 0,
              stationCount: 0,
              recentTenants: tenants.slice(0, 5)
            });
          }
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
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
                {stats.userCount || '—'}
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
                {stats.stationCount || '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Admin Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Information
            </Typography>
            {admin && (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {admin.firstName} {admin.lastName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {admin.email}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Role:</strong> {admin.role}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>

        {/* Recent Tenants */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tenants
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {stats.recentTenants && stats.recentTenants.length > 0 ? (
              <List>
                {stats.recentTenants.map((tenant) => (
                  <ListItem key={tenant.id} divider>
                    <ListItemText
                      primary={tenant.name}
                      secondary={`${tenant.email} • ${tenant.subscription_plan || 'basic'} plan`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No tenants found
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
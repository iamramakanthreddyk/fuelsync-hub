import { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import { apiGet } from '../../utils/api';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { ApiResponse } from '../../types/api';

interface AdminStats {
  totalTenants: number;
  totalUsers: number;
  totalStations: number;
  totalSales: number;
  recentActivity: Array<{
    id: string;
    adminId: string;
    adminEmail: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
  }>;
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiGet<ApiResponse<AdminStats>>('/admin/global-stats');
        if (response.status === 'success' && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <Grid container spacing={3}>
        {/* Admin Stats */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Tenants</Typography>
            <Typography variant="h3">{stats?.totalTenants || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{stats?.totalUsers || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Stations</Typography>
            <Typography variant="h3">{stats?.totalStations || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Sales</Typography>
            <Typography variant="h3">{stats?.totalSales || 0}</Typography>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Admin Activity</Typography>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Admin</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity Type</TableCell>
                    <TableCell>Entity ID</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.adminEmail}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.entityType}</TableCell>
                      <TableCell>{activity.entityId}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2">No recent activity</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}

// Wrap the dashboard content with the protected route component
export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={['superadmin']} isAdminRoute={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
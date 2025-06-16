// frontend/src/pages/dashboard/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  LocalGasStation as StationIcon,
  LocalGasStation as PumpIcon,
  AttachMoney as SalesIcon,
  CreditCard as CreditIcon
} from '@mui/icons-material';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStations: 0,
    totalPumps: 0,
    todaySales: 0,
    totalCredit: 0
  });
  
  useEffect(() => {
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [router]);
  
  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Dashboard">
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  <StationIcon fontSize="large" color="primary" />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.totalStations}</Typography>
                  <Typography variant="body2" color="textSecondary">Stations</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  <PumpIcon fontSize="large" color="secondary" />
                </Box>
                <Box>
                  <Typography variant="h4">{stats.totalPumps}</Typography>
                  <Typography variant="body2" color="textSecondary">Pumps</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  <SalesIcon fontSize="large" style={{ color: 'green' }} />
                </Box>
                <Box>
                  <Typography variant="h4">${stats.todaySales.toFixed(2)}</Typography>
                  <Typography variant="body2" color="textSecondary">Today's Sales</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box mr={2}>
                  <CreditIcon fontSize="large" style={{ color: 'orange' }} />
                </Box>
                <Box>
                  <Typography variant="h4">${stats.totalCredit.toFixed(2)}</Typography>
                  <Typography variant="body2" color="textSecondary">Total Credit</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
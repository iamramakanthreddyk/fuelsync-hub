import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import RecentSales from '../../components/dashboard/RecentSales';
import SaleForm from '../../components/forms/SaleForm';
import { apiGet, apiPost } from '../../utils/api';
import { useAuth } from '../../utils/auth';
import {
  LocalGasStation as StationIcon,
  LocalGasStation as PumpIcon,
  AttachMoney as SalesIcon,
  CreditCard as CreditIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface DashboardStats {
  totalStations: number;
  totalPumps: number;
  todaySales: number;
  totalCredit: number;
  recentSales: any[];
}

export default function Dashboard() {
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStations: 0,
    totalPumps: 0,
    todaySales: 0,
    totalCredit: 0,
    recentSales: []
  });
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  useEffect(() => {
    if (authLoading) return;
    
    const fetchDashboardData = async () => {
      try {
        const data = await apiGet<DashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [authLoading]);
  
  const handleOpenSaleDialog = () => {
    setSaleDialogOpen(true);
  };
  
  const handleCloseSaleDialog = () => {
    setSaleDialogOpen(false);
    setSubmitError('');
  };
  
  const handleSaleSubmit = async (formData: any) => {
    setSubmitting(true);
    setSubmitError('');
    
    try {
      await apiPost('/sales', formData);
      
      // Refresh dashboard data
      const newStats = await apiGet<DashboardStats>('/dashboard/stats');
      setStats(newStats);
      
      handleCloseSaleDialog();
    } catch (error: any) {
      console.error('Error recording sale:', error);
      setSubmitError(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <DashboardLayout title="Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Dashboard">
      <Grid container spacing={3}>
        {/* Quick Action Button */}
        {user?.role !== 'owner' && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenSaleDialog}
              >
                Record Sale
              </Button>
            </Box>
          </Grid>
        )}
        
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stations"
            value={stats.totalStations}
            icon={<StationIcon />}
            color="#1976d2"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pumps"
            value={stats.totalPumps}
            icon={<PumpIcon />}
            color="#9c27b0"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value={`$${stats.todaySales.toFixed(2)}`}
            icon={<SalesIcon />}
            color="#2e7d32"
            subtitle="Total sales today"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Credit"
            value={`$${stats.totalCredit.toFixed(2)}`}
            icon={<CreditIcon />}
            color="#ed6c02"
            subtitle="Total credit given"
          />
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12}>
          <RecentSales sales={stats.recentSales} />
        </Grid>

        {/* Station Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Station Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.totalStations === 0 ? (
                "No stations configured yet. Add your first station to start tracking fuel sales."
              ) : (
                "Station activity visualization will be available in a future update."
              )}
            </Typography>
          </Paper>
        </Grid>

        {/* Credit Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Credit Status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.totalCredit === 0 ? (
                "No outstanding credit at the moment."
              ) : (
                "Credit status visualization will be available in a future update."
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Sale Dialog */}
      <Dialog
        open={saleDialogOpen}
        onClose={handleCloseSaleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Record New Sale</DialogTitle>
        <DialogContent>
          <SaleForm
            onSubmit={handleSaleSubmit}
            onCancel={handleCloseSaleDialog}
            isSubmitting={submitting}
            submitError={submitError}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

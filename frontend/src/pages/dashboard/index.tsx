import { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, CircularProgress, Button, 
  Dialog, DialogTitle, DialogContent, Select, MenuItem
} from '@mui/material';
import { Line, Pie } from '@ant-design/charts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import RecentSales from '../../components/dashboard/RecentSales';
import SaleForm from '../../components/forms/SaleForm';
import { apiGet, apiPost } from '../../utils/api';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import {
  LocalGasStation as StationIcon,
  LocalGasStation as PumpIcon,
  AttachMoney as SalesIcon,
  CreditCard as CreditIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface Station {
  id: string;
  name: string;
}

interface DashboardStats {
  totalStations: number;
  totalPumps: number;
  todaySales: number;
  totalCredit: number;
  recentSales: any[];
  prices: { fuel_type: string; price: number; }[];
  sales: { total_amount: number; total_volume: number; };
  creditors: { customer_name: string; outstanding: number; last_sale: string; }[];
  trend: { sale_date: string; total_amount: number; }[];
  payments: { payment_method: string; total: number; }[];
}

function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [stations, setStations] = useState<Station[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStations: 0,
    totalPumps: 0,
    todaySales: 0,
    totalCredit: 0,
    recentSales: [],
    prices: [],
    sales: { total_amount: 0, total_volume: 0 },
    creditors: [],
    trend: [],
    payments: []
  });
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await apiGet<ApiResponse<Station[]>>('/stations');
        if (response.status === 'success' && response.data) {
          const stationsData = response.data;
          setStations(stationsData);
          if (stationsData.length > 0) {
            setSelectedStation(stationsData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    if (!selectedStation) return;
    
    const fetchDashboardData = async () => {
      try {
        const response = await apiGet<ApiResponse<DashboardStats>>(`/dashboard/stats?stationId=${selectedStation}`);
        if (response.status === 'success' && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [selectedStation]);
  
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
      const response = await apiPost<ApiResponse<any>>('/sales', formData);
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to record sale');
      }
      
      // Refresh dashboard data
      const statsResponse = await apiGet<ApiResponse<DashboardStats>>('/dashboard/stats');
      if (statsResponse.status === 'success' && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      handleCloseSaleDialog();
    } catch (error: any) {
      console.error('Error recording sale:', error);
      setSubmitError(error.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
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
        {/* Station Selector */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {stations.map((station) => (
                <MenuItem key={station.id} value={station.id}>
                  {station.name}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenSaleDialog}
            >
              Record Sale
            </Button>
          </Box>
        </Grid>

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
            value={`$${stats.todaySales?.toFixed(2)}`}
            icon={<SalesIcon />}
            color="#2e7d32"
            subtitle="Total sales today"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Credit"
            value={`$${stats.totalCredit?.toFixed(2)}`}
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

        {/* Charts Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>7-Day Sales Trend</Typography>
            {stats.trend.length > 0 ? (
              <Line
                data={stats.trend}
                xField="sale_date"
                yField="total_amount"
                point={{ size: 4 }}
                color="#1890ff"
                height={220}
                autoFit
              />
            ) : (
              <Typography>No sales data available</Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Payment Breakdown</Typography>
            {stats.payments.length > 0 ? (
              <Pie
                data={stats.payments}
                angleField="total"
                colorField="payment_method"
                radius={0.9}
                label={{ type: 'outer', content: '{name}: {percentage}' }}
                height={220}
                autoFit
              />
            ) : (
              <Typography>No payment data available</Typography>
            )}
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

// Wrap the dashboard content with the protected route component
export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
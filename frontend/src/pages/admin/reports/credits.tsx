// frontend/src/pages/admin/reports/credits.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function CreditReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tenantId, setTenantId] = useState('');
  const [stationId, setStationId] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    // Load tenants
    fetchTenants();
  }, []);

  useEffect(() => {
    // Load stations when tenant changes
    if (tenantId) {
      fetchStations(tenantId);
    } else {
      setStations([]);
      setStationId('');
    }
  }, [tenantId]);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data.data || []);
    } catch (err: any) {
      console.error('Error fetching tenants:', err);
      setError(err.message || 'Failed to fetch tenants');
    }
  };

  const fetchStations = async (tenantId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/stations?tenantId=${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stations');
      }

      const data = await response.json();
      setStations(data.data || []);
    } catch (err: any) {
      console.error('Error fetching stations:', err);
      setError(err.message || 'Failed to fetch stations');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      if (tenantId) {
        params.append('tenantId', tenantId);
      }
      if (stationId) {
        params.append('stationId', stationId);
      }

      const response = await fetch(`/api/admin/reports/credits?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch credit report');
      }

      const data = await response.json();
      setReportData(data.data);
    } catch (err: any) {
      console.error('Error fetching credit report:', err);
      setError(err.message || 'Failed to fetch credit report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <AdminLayout title="Credit Report">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Credit Report
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and analyze credit sales and outstanding balances
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel htmlFor="start-date">Start Date</InputLabel>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '16.5px 14px', marginTop: '16px' }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel htmlFor="end-date">End Date</InputLabel>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '16.5px 14px', marginTop: '16px' }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tenant</InputLabel>
              <Select
                value={tenantId}
                label="Tenant"
                onChange={(e) => setTenantId(e.target.value)}
              >
                <MenuItem value="">All Tenants</MenuItem>
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth disabled={!tenantId}>
              <InputLabel>Station</InputLabel>
              <Select
                value={stationId}
                label="Station"
                onChange={(e) => setStationId(e.target.value)}
              >
                <MenuItem value="">All Stations</MenuItem>
                {stations.map((station) => (
                  <MenuItem key={station.id} value={station.id}>
                    {station.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={fetchReport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {reportData && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Credit
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(reportData.summary.totalCredit)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Outstanding Credit
                    </Typography>
                    <Typography variant="h4" color="error">
                      {formatCurrency(reportData.summary.outstandingCredit)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Paid Credit
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(reportData.summary.paidCredit)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Payment Rate
                    </Typography>
                    <Typography variant="h4">
                      {reportData.summary.paymentRate.toFixed(2)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={reportData.summary.paymentRate} 
                      color={reportData.summary.paymentRate > 80 ? "success" : reportData.summary.paymentRate > 50 ? "warning" : "error"}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              Credit Details by Creditor
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Station</TableCell>
                    <TableCell>Creditor</TableCell>
                    <TableCell align="right">Total Credit</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Payment Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.details.map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{row.tenant_name}</TableCell>
                      <TableCell>{row.station_name}</TableCell>
                      <TableCell>{row.creditor_name || 'Unknown'}</TableCell>
                      <TableCell align="right">{formatCurrency(row.total_credit)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.outstanding_credit)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.paid_credit)}</TableCell>
                      <TableCell align="right">
                        {row.total_credit > 0 ? ((row.paid_credit / row.total_credit) * 100).toFixed(2) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </AdminLayout>
  );
}
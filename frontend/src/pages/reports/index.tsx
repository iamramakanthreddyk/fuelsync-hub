// frontend/src/pages/reports/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Download as DownloadIcon } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Station {
  id: string;
  name: string;
}

interface SalesSummary {
  totalSales: number;
  totalVolume: number;
  salesByFuelType: { [key: string]: { volume: number; amount: number } };
  salesByPaymentMethod: { [key: string]: number };
  dailySales: { date: string; amount: number; volume: number }[];
}

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stations, setStations] = useState<Station[]>([]);
  const [filters, setFilters] = useState({
    stationId: '',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    totalSales: 0,
    totalVolume: 0,
    salesByFuelType: {},
    salesByPaymentMethod: {},
    dailySales: []
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    // Verify authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchStations = async () => {
      try {
        const response = await fetch('/api/stations');
        const data = await response.json();
        
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setStations(data);
        } else {
          setStations([]);
          console.error('Received invalid stations data:', data);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
        setStations([]);
      }
    };

    fetchStations();
  }, [router]);

  useEffect(() => {
    // Load initial report if we have a station selected
    if (filters.stationId) {
      fetchSalesReport();
    }
  }, [filters.stationId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const fetchSalesReport = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setReportLoading(true);

    try {
      // Fetch sales summary
      const summaryResponse = await fetch(
        `/api/reports/sales-summary?stationId=${filters.stationId}&startDate=${filters.startDate}&endDate=${filters.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch sales summary');
      }

      const summaryData = await summaryResponse.json();
      setSalesSummary(summaryData);

      // Fetch detailed sales data
      const salesResponse = await fetch(
        `/api/reports/sales-detail?stationId=${filters.stationId}&startDate=${filters.startDate}&endDate=${filters.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!salesResponse.ok) {
        throw new Error('Failed to fetch sales details');
      }

      const salesDetailData = await salesResponse.json();
      setSalesData(salesDetailData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const exportToCsv = () => {
    if (salesData.length === 0) return;

    // Create CSV content
    const headers = Object.keys(salesData[0]).join(',');
    const rows = salesData.map(row =>
      Object.values(row).map(value =>
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${filters.startDate}_to_${filters.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <DashboardLayout title="Reports">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports">
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
            <Tab label="Sales Report" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Inventory Report" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Credit Report" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>

        {/* Sales Report Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Report Filters */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Report Filters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="station-label">Station</InputLabel>
                      <Select
                        labelId="station-label"
                        id="stationId"
                        name="stationId"
                        value={filters.stationId}
                        label="Station"
                        onChange={handleSelectChange}
                      >
                        {(stations || []).map((station) => (
                          <MenuItem key={station.id} value={station.id}>
                            {station.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      id="startDate"
                      name="startDate"
                      label="Start Date"
                      type="date"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      id="endDate"
                      name="endDate"
                      label="End Date"
                      type="date"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={fetchSalesReport}
                    >
                      Generate
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {reportLoading ? (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : (
              <>
                {/* Summary Cards */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Total Sales
                      </Typography>
                      <Typography variant="h4" component="div">
                        ${salesSummary.totalSales?.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Total Volume
                      </Typography>
                      <Typography variant="h4" component="div">
                        {salesSummary.totalVolume?.toFixed(2)} L
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Cash Sales
                      </Typography>
                      <Typography variant="h4" component="div">
                        ${(salesSummary.salesByPaymentMethod.cash || 0)?.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Credit Given
                      </Typography>
                      <Typography variant="h4" component="div">
                        ${(salesSummary.salesByPaymentMethod.credit || 0)?.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Sales by Fuel Type */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sales by Fuel Type
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Fuel Type</TableCell>
                              <TableCell align="right">Volume (L)</TableCell>
                              <TableCell align="right">Amount ($)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(salesSummary.salesByFuelType).map(([fuelType, data]) => (
                              <TableRow key={fuelType}>
                                <TableCell>{fuelType?.toUpperCase()}</TableCell>
                                <TableCell align="right">{data.volume?.toFixed(2)}</TableCell>
                                <TableCell align="right">${data.amount?.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Sales by Payment Method */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sales by Payment Method
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Payment Method</TableCell>
                              <TableCell align="right">Amount ($)</TableCell>
                              <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(salesSummary.salesByPaymentMethod).map(([method, amount]) => (
                              <TableRow key={method}>
                                <TableCell>{method.charAt(0)?.toUpperCase() + method.slice(1)}</TableCell>
                                <TableCell align="right">${amount?.toFixed(2)}</TableCell>
                                <TableCell align="right">
                                  {salesSummary.totalSales > 0
                                    ? `${((amount / salesSummary.totalSales) * 100)?.toFixed(1)}%`
                                    : '0%'
                                  }
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Detailed Sales Data */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                          Detailed Sales Data
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={exportToCsv}
                          disabled={salesData.length === 0}
                        >
                          Export CSV
                        </Button>
                      </Box>
                      <Divider sx={{ mb: 2 }} />

                      <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date/Time</TableCell>
                              <TableCell>Fuel Type</TableCell>
                              <TableCell align="right">Volume (L)</TableCell>
                              <TableCell align="right">Price/L</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell>Payment</TableCell>
                              <TableCell>Recorded By</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {salesData.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} align="center">No sales data available</TableCell>
                              </TableRow>
                            ) : (
                              salesData.map((sale) => (
                                <TableRow key={sale.id}>
                                  <TableCell>{new Date(sale.recordedAt).toLocaleString()}</TableCell>
                                  <TableCell>{sale.fuelType?.toUpperCase()}</TableCell>
                                  <TableCell align="right">{sale.saleVolume?.toFixed(2)}</TableCell>
                                  <TableCell align="right">${sale.fuelPrice?.toFixed(2)}</TableCell>
                                  <TableCell align="right">${sale.amount?.toFixed(2)}</TableCell>
                                  <TableCell>{sale.paymentMethod}</TableCell>
                                  <TableCell>{sale.employeeName}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Inventory Report Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Inventory Report
          </Typography>
          <Typography variant="body1">
            Inventory reporting functionality will be available in a future update.
          </Typography>
        </TabPanel>

        {/* Credit Report Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Credit Report
          </Typography>
          <Typography variant="body1">
            Credit reporting functionality will be available in a future update.
          </Typography>
        </TabPanel>
      </Paper>
    </DashboardLayout>
  );
}
// frontend/src/pages/reconciliations/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Add as AddIcon, Check as CheckIcon } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Station {
  id: string;
  name: string;
}

interface Reconciliation {
  id: string;
  stationId: string;
  stationName: string;
  date: string;
  totalSales: number;
  cashTotal: number;
  creditTotal: number;
  cardTotal: number;
  upiTotal: number;
  finalized: boolean;
  createdBy: string;
  createdByName: string;
  notes: string;
}

export default function Reconciliations() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [dailySales, setDailySales] = useState({
    totalSales: 0,
    cashTotal: 0,
    creditTotal: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    stationId: '',
    date: new Date().toISOString().split('T')[0],
    cardTotal: '',
    upiTotal: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({
    stationId: '',
    date: '',
    cardTotal: '',
    upiTotal: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reconciliations
        const recsResponse = await fetch('/api/reconciliations', {
          credentials: 'include'
        });

        if (!recsResponse.ok) {
          throw new Error('Failed to fetch reconciliations');
        }

        const recsData = await recsResponse.json();
        setReconciliations(recsData);

        // Fetch stations
        const stationsResponse = await fetch('/api/stations', {
          credentials: 'include'
        });

        if (!stationsResponse.ok) {
          throw new Error('Failed to fetch stations');
        }

        const stationsData = await stationsResponse.json();
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchDailySales = async (stationId: string, date: string) => {
    try {
      const response = await fetch(`/api/sales/daily-totals?stationId=${stationId}&date=${date}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily sales totals');
      }

      const data = await response.json();
      setDailySales({
        totalSales: data.totalSales || 0,
        cashTotal: data.cashTotal || 0,
        creditTotal: data.creditTotal || 0
      });

      // Check if a reconciliation already exists
      const existingRec = reconciliations.find(
        r => r.stationId === stationId && r.date === date
      );

      if (existingRec) {
        setFormData(prev => ({
          ...prev,
          cardTotal: existingRec.cardTotal.toString(),
          upiTotal: existingRec.upiTotal.toString(),
          notes: existingRec.notes
        }));

        if (existingRec.finalized) {
          setSnackbar({
            open: true,
            message: 'This day has already been finalized and cannot be modified',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch daily sales data',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      stationId: '',
      date: new Date().toISOString().split('T')[0],
      cardTotal: '',
      upiTotal: '',
      notes: ''
    });
    setFormErrors({
      stationId: '',
      date: '',
      cardTotal: '',
      upiTotal: ''
    });
    setDailySales({
      totalSales: 0,
      cashTotal: 0,
      creditTotal: 0
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));

    // Clear the related error
    setFormErrors(prev => ({
      ...prev,
      [name as string]: ''
    }));

    // If station or date changes, fetch daily sales
    if ((name === 'stationId' || name === 'date') && formData.stationId && formData.date) {
      fetchDailySales(
        name === 'stationId' ? value as string : formData.stationId,
        name === 'date' ? value as string : formData.date
      );
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };

    if (!formData.stationId) {
      newErrors.stationId = 'Station is required';
      valid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
      valid = false;
    }

    if (!formData.cardTotal) {
      newErrors.cardTotal = 'Card total is required';
      valid = false;
    }

    if (!formData.upiTotal) {
      newErrors.upiTotal = 'UPI total is required';
      valid = false;
    }

    // Validate that all payment methods add up to total sales
    const cardTotal = parseFloat(formData.cardTotal || '0');
    const upiTotal = parseFloat(formData.upiTotal || '0');
    const expectedTotal = parseFloat(dailySales.totalSales?.toFixed(2));
    const actualTotal = parseFloat((dailySales.cashTotal + dailySales.creditTotal + cardTotal + upiTotal)?.toFixed(2));

    if (Math.abs(actualTotal - expectedTotal) > 0.01) {
      newErrors.cardTotal = 'Payment totals must equal total sales';
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/reconciliations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          stationId: formData.stationId,
          date: formData.date,
          totalSales: dailySales.totalSales,
          cashTotal: dailySales.cashTotal,
          creditTotal: dailySales.creditTotal,
          cardTotal: parseFloat(formData.cardTotal),
          upiTotal: parseFloat(formData.upiTotal),
          finalized: true,
          notes: formData.notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create reconciliation');
      }

      const data = await response.json();

      // Add new reconciliation to the list
      setReconciliations(prev => [data, ...prev]);

      setSnackbar({
        open: true,
        message: 'Day reconciliation completed successfully',
        severity: 'success'
      });

      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating reconciliation:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create reconciliation',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Reconciliations">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Daily Reconciliations">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Daily Reconciliations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Reconciliation
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Total Sales</TableCell>
                <TableCell>Cash</TableCell>
                <TableCell>Credit</TableCell>
                <TableCell>Card</TableCell>
                <TableCell>UPI</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reconciliations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No reconciliations found. Click &quot;New Reconciliation&quot; to create your first reconciliation.
                  </TableCell>
                </TableRow>
              ) : (
                reconciliations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                      <TableCell>{rec.stationName}</TableCell>
                      <TableCell>${rec.totalSales?.toFixed(2)}</TableCell>
                      <TableCell>${rec.cashTotal?.toFixed(2)}</TableCell>
                      <TableCell>${rec.creditTotal?.toFixed(2)}</TableCell>
                      <TableCell>${rec.cardTotal?.toFixed(2)}</TableCell>
                      <TableCell>${rec.upiTotal?.toFixed(2)}</TableCell>
                      <TableCell>
                        {rec.finalized ? (
                          <Chip
                            icon={<CheckIcon />}
                            label="Finalized"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip label="Draft" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{rec.createdByName}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={reconciliations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* New Reconciliation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Daily Reconciliation</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Station & Date Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.stationId}>
                <InputLabel id="station-label">Station</InputLabel>
                <Select
                  labelId="station-label"
                  id="stationId"
                  name="stationId"
                  value={formData.stationId}
                  label="Station"
                  onChange={handleChange}
                >
                  {stations.map((station) => (
                    <MenuItem key={station.id} value={station.id}>
                      {station.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.stationId && <FormHelperText>{formErrors.stationId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="date"
                name="date"
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                error={!!formErrors.date}
                helperText={formErrors.date}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Sales Totals */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Sales Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="Total Sales"
                      value={`$${dailySales.totalSales?.toFixed(2)}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="Cash Total"
                      value={`$${dailySales.cashTotal?.toFixed(2)}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      disabled
                      label="Credit Total"
                      value={`$${dailySales.creditTotal?.toFixed(2)}`}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Additional Payment Methods */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Card Total"
                name="cardTotal"
                value={formData.cardTotal}
                onChange={handleChange}
                type="number"
                error={!!formErrors.cardTotal}
                helperText={formErrors.cardTotal || "Total amount collected via credit/debit cards"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="UPI Total"
                name="upiTotal"
                value={formData.upiTotal}
                onChange={handleChange}
                type="number"
                error={!!formErrors.upiTotal}
                helperText={formErrors.upiTotal || "Total amount collected via UPI payments"}
              />
            </Grid>

            {/* Payment Verification */}
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: (formData.cardTotal && formData.upiTotal)
                    ? Math.abs((dailySales.cashTotal + dailySales.creditTotal + parseFloat(formData.cardTotal) + parseFloat(formData.upiTotal)) - dailySales.totalSales) <= 0.01
                      ? 'success.light'
                      : 'error.light'
                    : 'background.paper'
                }}
              >
                <Typography variant="subtitle1" gutterBottom>Payment Verification</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Total Sales"
                      value={`$${dailySales.totalSales?.toFixed(2)}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      disabled
                      label="Total Payments"
                      value={`$${(
                        dailySales.cashTotal +
                        dailySales.creditTotal +
                        parseFloat(formData.cardTotal || '0') +
                        parseFloat(formData.upiTotal || '0')
                      )?.toFixed(2)}`}
                    />
                  </Grid>
                  {formData.cardTotal && formData.upiTotal && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color={
                        Math.abs((dailySales.cashTotal + dailySales.creditTotal + parseFloat(formData.cardTotal) + parseFloat(formData.upiTotal)) - dailySales.totalSales) <= 0.01
                          ? 'success.main'
                          : 'error.main'
                      }>
                        {Math.abs((dailySales.cashTotal + dailySales.creditTotal + parseFloat(formData.cardTotal) + parseFloat(formData.upiTotal)) - dailySales.totalSales) <= 0.01
                          ? '✓ Payments match total sales'
                          : '✗ Payments do not match total sales'
                        }
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.stationId || !formData.date || !formData.cardTotal || !formData.upiTotal || dailySales.totalSales <= 0}
          >
            Finalize Day
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

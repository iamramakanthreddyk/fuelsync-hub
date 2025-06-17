// frontend/src/pages/sales/index.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
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
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AuthenticatedDashboardLayout from '@/components/layout/AuthenticatedDashboardLayout';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import ErrorAlert from '@/components/common/ErrorAlert';
import { apiGet, apiPost } from '@/utils/api';
import { ApiResponse } from '@/types/api';
import { formatErrorMessage } from '@/utils/errorHandler';

interface Station {
  id: string;
  name: string;
}

interface Nozzle {
  id: string;
  fuel_type: string;
  pump_id: string;
  pump_name: string;
  current_reading: number;
}

interface Sale {
  id: string;
  recorded_at: string;
  station_name: string;
  pump_name: string;
  fuel_type: string;
  sale_volume: number;
  fuel_price: number;
  amount: number;
  cash_received: number;
  credit_given: number;
  payment_method: string;
  creditor_name: string;
  employee_name: string;
}

interface Creditor {
  id: string;
  party_name: string;
  running_balance: number;
}

function SalesContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    stationId: '',
    nozzleId: '',
    cumulativeReading: '',
    cashReceived: '',
    creditGiven: '0',
    creditPartyId: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({
    stationId: '',
    nozzleId: '',
    cumulativeReading: '',
    cashReceived: '',
    creditGiven: '',
    creditPartyId: ''
  });
  const [calculatedValues, setCalculatedValues] = useState({
    previousReading: 0,
    saleVolume: 0,
    fuelPrice: 0,
    totalAmount: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sales
        const salesResponse = await apiGet<ApiResponse<Sale[]>>('/sales');
        if (salesResponse.status === 'success' && salesResponse.data) {
          setSales(salesResponse.data);
        }
        
        // Fetch stations
        const stationsResponse = await apiGet<ApiResponse<Station[]>>('/stations');
        if (stationsResponse.status === 'success' && stationsResponse.data) {
          setStations(stationsResponse.data);
        }
        
        // Fetch creditors
        const creditorsResponse = await apiGet<ApiResponse<Creditor[]>>('/creditors');
        if (creditorsResponse.status === 'success' && creditorsResponse.data) {
          setCreditors(creditorsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const fetchNozzlesByStation = async (stationId: string) => {
    try {
      const response = await apiGet<ApiResponse<Nozzle[]>>(`/stations/${stationId}/nozzles`);
      if (response.status === 'success' && response.data) {
        setNozzles(response.data);
      }
    } catch (error) {
      console.error('Error fetching nozzles:', error);
      setSnackbar({
        open: true,
        message: formatErrorMessage(error),
        severity: 'error'
      });
    }
  };
  
  const fetchNozzleDetails = async (nozzleId: string) => {
    try {
      const nozzleResponse = await apiGet<ApiResponse<Nozzle>>(`/nozzles/${nozzleId}`);
      if (nozzleResponse.status !== 'success' || !nozzleResponse.data) {
        throw new Error('Failed to fetch nozzle details');
      }
      
      const nozzleData = nozzleResponse.data;
      
      // Fetch current fuel price
      const priceResponse = await apiGet<ApiResponse<{ price_per_unit: number }>>(
        `/fuel-prices?stationId=${formData.stationId}&fuelType=${nozzleData.fuel_type}`
      );
      
      if (priceResponse.status !== 'success' || !priceResponse.data) {
        throw new Error('Failed to fetch fuel price');
      }
      
      setCalculatedValues({
        previousReading: nozzleData.current_reading,
        saleVolume: 0,
        fuelPrice: priceResponse.data.price_per_unit,
        totalAmount: 0
      });
    } catch (error) {
      console.error('Error fetching nozzle details:', error);
      setSnackbar({
        open: true,
        message: formatErrorMessage(error),
        severity: 'error'
      });
    }
  };
  
  const handleOpenDialog = () => {
    setFormData({
      stationId: '',
      nozzleId: '',
      cumulativeReading: '',
      cashReceived: '',
      creditGiven: '0',
      creditPartyId: '',
      notes: ''
    });
    setFormErrors({
      stationId: '',
      nozzleId: '',
      cumulativeReading: '',
      cashReceived: '',
      creditGiven: '',
      creditPartyId: ''
    });
    setCalculatedValues({
      previousReading: 0,
      saleVolume: 0,
      fuelPrice: 0,
      totalAmount: 0
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
    
    // Handle special cases
    if (name === 'stationId' && value) {
      fetchNozzlesByStation(value as string);
      // Reset nozzle selection
      setFormData(prev => ({
        ...prev,
        nozzleId: ''
      }));
    } else if (name === 'nozzleId' && value) {
      fetchNozzleDetails(value as string);
    } else if (name === 'cumulativeReading' && value && calculatedValues.previousReading > 0) {
      const cumulativeReading = parseFloat(value as string);
      const saleVolume = cumulativeReading - calculatedValues.previousReading;
      const totalAmount = saleVolume * calculatedValues.fuelPrice;
      
      setCalculatedValues(prev => ({
        ...prev,
        saleVolume,
        totalAmount
      }));
      
      // Auto-fill cash received with total amount
      setFormData(prev => ({
        ...prev,
        cashReceived: totalAmount?.toFixed(2)
      }));
    } else if ((name === 'cashReceived' || name === 'creditGiven') && calculatedValues.totalAmount > 0) {
      const cashReceived = parseFloat(formData.cashReceived || '0');
      const creditGiven = parseFloat(formData.creditGiven || '0');
      
      // If changing cash, adjust credit to maintain total
      if (name === 'cashReceived') {
        const newCash = parseFloat(value as string) || 0;
        const newCredit = Math.max(0, calculatedValues.totalAmount - newCash);
        
        setFormData(prev => ({
          ...prev,
          creditGiven: newCredit?.toFixed(2)
        }));
      }
      
      // If changing credit, adjust cash to maintain total
      if (name === 'creditGiven') {
        const newCredit = parseFloat(value as string) || 0;
        const newCash = Math.max(0, calculatedValues.totalAmount - newCredit);
        
        setFormData(prev => ({
          ...prev,
          cashReceived: newCash?.toFixed(2)
        }));
      }
    }
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...formErrors };
    
    if (!formData.stationId) {
      newErrors.stationId = 'Station is required';
      valid = false;
    }
    
    if (!formData.nozzleId) {
      newErrors.nozzleId = 'Nozzle is required';
      valid = false;
    }
    
    if (!formData.cumulativeReading) {
      newErrors.cumulativeReading = 'Cumulative reading is required';
      valid = false;
    } else if (parseFloat(formData.cumulativeReading) <= calculatedValues.previousReading) {
      newErrors.cumulativeReading = 'Reading must be greater than previous reading';
      valid = false;
    }
    
    if (!formData.cashReceived) {
      newErrors.cashReceived = 'Cash received is required';
      valid = false;
    }
    
    if (parseFloat(formData.creditGiven) > 0 && !formData.creditPartyId) {
      newErrors.creditPartyId = 'Credit party is required when giving credit';
      valid = false;
    }
    
    // Validate that cash + credit = total amount
    const cashReceived = parseFloat(formData.cashReceived || '0');
    const creditGiven = parseFloat(formData.creditGiven || '0');
    
    if (Math.abs((cashReceived + creditGiven) - calculatedValues.totalAmount) > 0.01) {
      newErrors.cashReceived = 'Cash + Credit must equal total amount';
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
      const response = await apiPost<ApiResponse<Sale>>('/sales', {
        stationId: formData.stationId,
        nozzleId: formData.nozzleId,
        cumulativeReading: parseFloat(formData.cumulativeReading),
        cashReceived: parseFloat(formData.cashReceived),
        creditGiven: parseFloat(formData.creditGiven),
        creditPartyId: formData.creditPartyId || null,
        notes: formData.notes
      });
      
      if (response.status === 'success' && response.data) {
        // Add new sale to the list
        setSales(prev => [response.data as Sale, ...prev]);
        
        setSnackbar({
          open: true,
          message: 'Sale recorded successfully',
          severity: 'success'
        });
        
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      setSnackbar({
        open: true,
        message: formatErrorMessage(error),
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
    return <LoadingIndicator message="Loading sales data..." />;
  }
  
  if (error) {
    return <ErrorAlert error={error} />;
  }
  
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Sales Records</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Record Sale
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date/Time</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Fuel Type</TableCell>
                <TableCell>Volume</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Recorded By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No sales records found. Click "Record Sale" to add your first sale.
                  </TableCell>
                </TableRow>
              ) : (
                sales
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.recorded_at).toLocaleString()}</TableCell>
                      <TableCell>{sale.station_name}</TableCell>
                      <TableCell>{sale.fuel_type}</TableCell>
                      <TableCell>{sale.sale_volume?.toFixed(2)}</TableCell>
                      <TableCell>${sale.fuel_price?.toFixed(2)}</TableCell>
                      <TableCell>${sale.amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        {sale.payment_method === 'cash' && `Cash: $${sale.cash_received?.toFixed(2)}`}
                        {sale.payment_method === 'credit' && `Credit: $${sale.credit_given?.toFixed(2)} to ${sale.creditor_name}`}
                        {sale.payment_method === 'mixed' && (
                          <>
                            Cash: ${sale.cash_received?.toFixed(2)}
                            <br />
                            Credit: ${sale.credit_given?.toFixed(2)} to {sale.creditor_name}
                          </>
                        )}
                      </TableCell>
                      <TableCell>{sale.employee_name}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Record Sale Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Record New Sale</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Station & Nozzle Selection */}
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
              <FormControl fullWidth error={!!formErrors.nozzleId} disabled={!formData.stationId}>
                <InputLabel id="nozzle-label">Nozzle</InputLabel>
                <Select
                  labelId="nozzle-label"
                  id="nozzleId"
                  name="nozzleId"
                  value={formData.nozzleId}
                  label="Nozzle"
                  onChange={handleChange}
                >
                  {nozzles.map((nozzle) => (
                    <MenuItem key={nozzle.id} value={nozzle.id}>
                      {nozzle.pump_name} - {nozzle.fuel_type}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.nozzleId && <FormHelperText>{formErrors.nozzleId}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Readings & Calculations */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                label="Previous Reading"
                value={calculatedValues.previousReading?.toFixed(2)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Cumulative Reading"
                name="cumulativeReading"
                value={formData.cumulativeReading}
                onChange={handleChange}
                type="number"
                error={!!formErrors.cumulativeReading}
                helperText={formErrors.cumulativeReading}
                disabled={!formData.nozzleId}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                label="Sale Volume"
                value={calculatedValues.saleVolume?.toFixed(2)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                label="Fuel Price"
                value={`$${calculatedValues.fuelPrice?.toFixed(2)}`}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                disabled
                label="Total Amount"
                value={`$${calculatedValues.totalAmount?.toFixed(2)}`}
              />
            </Grid>

            {/* Payment */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Cash Received"
                name="cashReceived"
                value={formData.cashReceived}
                onChange={handleChange}
                type="number"
                error={!!formErrors.cashReceived}
                helperText={formErrors.cashReceived}
                disabled={!formData.cumulativeReading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Credit Given"
                name="creditGiven"
                value={formData.creditGiven}
                onChange={handleChange}
                type="number"
                error={!!formErrors.creditGiven}
                helperText={formErrors.creditGiven}
                disabled={!formData.cumulativeReading}
              />
            </Grid>

            {parseFloat(formData.creditGiven) > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.creditPartyId}>
                  <InputLabel id="creditor-label">Credit Party</InputLabel>
                  <Select
                    labelId="creditor-label"
                    id="creditPartyId"
                    name="creditPartyId"
                    value={formData.creditPartyId}
                    label="Credit Party"
                    onChange={handleChange}
                  >
                    {creditors.map((creditor) => (
                      <MenuItem key={creditor.id} value={creditor.id}>
                        {creditor.party_name} (Balance: ${creditor.running_balance?.toFixed(2)})
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.creditPartyId && <FormHelperText>{formErrors.creditPartyId}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

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
            disabled={!formData.stationId || !formData.nozzleId || !formData.cumulativeReading}
          >
            Record Sale
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
    </>
  );
}

export default function Sales() {
  return (
    <AuthenticatedDashboardLayout 
      title="Sales" 
      requiredRoles={['owner', 'manager', 'employee']}
    >
      <SalesContent />
    </AuthenticatedDashboardLayout>
  );
}
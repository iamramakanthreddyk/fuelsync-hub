import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { apiGet } from '../../utils/api';

interface Station {
  id: string;
  name: string;
}

interface ReconciliationFormData {
  stationId: string;
  date: string;
  cardTotal: string;
  upiTotal: string;
  notes: string;
}

interface DailySalesTotals {
  totalSales: number;
  cashTotal: number;
  creditTotal: number;
}

interface ReconciliationFormProps {
  onSubmit: (data: ReconciliationFormData & DailySalesTotals) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string;
}

const ReconciliationForm: React.FC<ReconciliationFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<ReconciliationFormData>({
    stationId: '',
    date: today,
    cardTotal: '0',
    upiTotal: '0',
    notes: ''
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailySalesTotals>({
    totalSales: 0,
    cashTotal: 0,
    creditTotal: 0
  });
  
  const [loading, setLoading] = useState({
    stations: true,
    dailyTotals: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReconciliationFormData, string>>>({});

  // Load stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await apiGet<Station[]>('/stations');
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setLoading(prev => ({ ...prev, stations: false }));
      }
    };

    fetchStations();
  }, []);

  // Load daily sales totals when station and date change
  useEffect(() => {
    const fetchDailySalesTotals = async () => {
      if (!formData.stationId || !formData.date) return;
      
      setLoading(prev => ({ ...prev, dailyTotals: true }));
      
      try {
        const data = await apiGet<DailySalesTotals>(
          `/reconciliations/daily-totals?stationId=${formData.stationId}&date=${formData.date}`
        );
        
        setDailyTotals(data);
      } catch (error) {
        console.error('Error fetching daily sales totals:', error);
      } finally {
        setLoading(prev => ({ ...prev, dailyTotals: false }));
      }
    };

    fetchDailySalesTotals();
  }, [formData.stationId, formData.date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as keyof ReconciliationFormData;
    const value = e.target.value as string;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReconciliationFormData, string>> = {};
    
    if (!formData.stationId) {
      newErrors.stationId = 'Station is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.cardTotal) {
      newErrors.cardTotal = 'Card total is required';
    }

    if (!formData.upiTotal) {
      newErrors.upiTotal = 'UPI total is required';
    }

    // Validate payment totals
    const cardTotal = parseFloat(formData.cardTotal || '0');
    const upiTotal = parseFloat(formData.upiTotal || '0');
    const totalPayments = dailyTotals.cashTotal + dailyTotals.creditTotal + cardTotal + upiTotal;
    
    if (Math.abs(totalPayments - dailyTotals.totalSales) > 0.01) {
      newErrors.cardTotal = 'All payment methods must equal total sales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        ...dailyTotals
      });
    }
  };

  // Calculate if totals match
  const totalPayments = dailyTotals.cashTotal + dailyTotals.creditTotal +
    parseFloat(formData.cardTotal || '0') + parseFloat(formData.upiTotal || '0');
  
  const totalsMatch = Math.abs(totalPayments - dailyTotals.totalSales) <= 0.01;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        {/* Station & Date Selection */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.stationId} disabled={isSubmitting}>
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
            {errors.stationId && <FormHelperText>{errors.stationId}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="date"
            name="date"
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: today
            }}
            disabled={isSubmitting}
          />
        </Grid>
        
        {/* Sales Summary */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Sales Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  label="Total Sales"
                  value={`$${dailyTotals.totalSales.toFixed(2)}`}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  label="Cash Received"
                  value={`$${dailyTotals.cashTotal.toFixed(2)}`}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  label="Credit Given"
                  value={`$${dailyTotals.creditTotal.toFixed(2)}`}
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
            inputProps={{ step: '0.01', min: '0' }}
            error={!!errors.cardTotal}
            helperText={errors.cardTotal || "Total amount collected via credit/debit cards"}
            disabled={isSubmitting || dailyTotals.totalSales === 0}
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
            inputProps={{ step: '0.01', min: '0' }}
            error={!!errors.upiTotal}
            helperText={errors.upiTotal || "Total amount collected via UPI payments"}
            disabled={isSubmitting || dailyTotals.totalSales === 0}
          />
        </Grid>
        
        {/* Payment Verification */}
        <Grid item xs={12}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              bgcolor: dailyTotals.totalSales > 0 
                ? (totalsMatch ? 'success.light' : 'error.light')
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
                  value={`$${dailyTotals.totalSales.toFixed(2)}`}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  disabled
                  label="Total Payments"
                  value={`$${totalPayments.toFixed(2)}`}
                />
              </Grid>
              {dailyTotals.totalSales > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color={totalsMatch ? 'success.main' : 'error.main'}>
                    {totalsMatch
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
            disabled={isSubmitting}
          />
        </Grid>
      </Grid>
      
      {submitError && (
        <FormHelperText error sx={{ mt: 2 }}>
          {submitError}
        </FormHelperText>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={isSubmitting || dailyTotals.totalSales === 0 || !totalsMatch}
        >
          {isSubmitting ? 'Saving...' : 'Finalize Day'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReconciliationForm;
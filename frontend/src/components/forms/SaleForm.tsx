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

interface Nozzle {
  id: string;
  pumpId: string;
  fuelType: string;
  pumpName: string;
  currentReading: number;
}

interface Creditor {
  id: string;
  partyName: string;
  runningBalance: number;
}

interface SaleFormData {
  stationId: string;
  nozzleId: string;
  cumulativeReading: string;
  cashReceived: string;
  creditGiven: string;
  creditPartyId: string;
  notes: string;
}

interface SaleFormProps {
  onSubmit: (data: SaleFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string;
}

const SaleForm: React.FC<SaleFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}) => {
  const [formData, setFormData] = useState<SaleFormData>({
    stationId: '',
    nozzleId: '',
    cumulativeReading: '',
    cashReceived: '',
    creditGiven: '0',
    creditPartyId: '',
    notes: ''
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [loading, setLoading] = useState({
    stations: true,
    nozzles: false,
    creditors: false
  });

  const [calculatedValues, setCalculatedValues] = useState({
    previousReading: 0,
    saleVolume: 0,
    fuelPrice: 0,
    totalAmount: 0
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SaleFormData, string>>>({});

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

  // Load creditors
  useEffect(() => {
    const fetchCreditors = async () => {
      if (!formData.stationId) return;
      
      setLoading(prev => ({ ...prev, creditors: true }));
      
      try {
        const data = await apiGet<Creditor[]>(`/creditors?stationId=${formData.stationId}`);
        setCreditors(data);
      } catch (error) {
        console.error('Error fetching creditors:', error);
      } finally {
        setLoading(prev => ({ ...prev, creditors: false }));
      }
    };

    fetchCreditors();
  }, [formData.stationId]);

  // Load nozzles when station changes
  useEffect(() => {
    const fetchNozzles = async () => {
      if (!formData.stationId) return;
      
      setLoading(prev => ({ ...prev, nozzles: true }));
      setFormData(prev => ({ ...prev, nozzleId: '' }));
      
      try {
        const data = await apiGet<Nozzle[]>(`/nozzles/station/${formData.stationId}`);
        setNozzles(data);
      } catch (error) {
        console.error('Error fetching nozzles:', error);
      } finally {
        setLoading(prev => ({ ...prev, nozzles: false }));
      }
    };

    fetchNozzles();
  }, [formData.stationId]);

  // Fetch nozzle details when nozzle changes
  useEffect(() => {
    const fetchNozzleDetails = async () => {
      if (!formData.nozzleId) return;
      
      try {
        // Get nozzle details
        const nozzle = await apiGet<Nozzle>(`/nozzles/${formData.nozzleId}`);
        
        // Get current fuel price
        const priceResponse = await apiGet<{ pricePerUnit: number }>(
          `/fuel-prices?stationId=${formData.stationId}&fuelType=${nozzle.fuelType}`
        );
        
        setCalculatedValues({
          previousReading: nozzle.currentReading,
          saleVolume: 0,
          fuelPrice: priceResponse.pricePerUnit,
          totalAmount: 0
        });
      } catch (error) {
        console.error('Error fetching nozzle details:', error);
      }
    };

    fetchNozzleDetails();
  }, [formData.nozzleId, formData.stationId]);

  // Calculate volume and amount when reading changes
  useEffect(() => {
    if (formData.cumulativeReading && calculatedValues.previousReading > 0) {
      const cumulativeReading = parseFloat(formData.cumulativeReading);
      
      if (cumulativeReading > calculatedValues.previousReading) {
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
          cashReceived: totalAmount.toFixed(2),
          creditGiven: '0'
        }));
      }
    }
  }, [formData.cumulativeReading, calculatedValues.previousReading, calculatedValues.fuelPrice]);

  // Balance cash and credit to match total amount
  useEffect(() => {
    if (calculatedValues.totalAmount > 0 && (formData.cashReceived || formData.creditGiven)) {
      const cashReceived = parseFloat(formData.cashReceived || '0');
      const creditGiven = parseFloat(formData.creditGiven || '0');
      
      // Skip if we're not changing anything
      if (Math.abs((cashReceived + creditGiven) - calculatedValues.totalAmount) < 0.01) {
        return;
      }
      
      // If cash exceeds total, adjust cash down and set credit to 0
      if (cashReceived > calculatedValues.totalAmount) {
        setFormData(prev => ({
          ...prev,
          cashReceived: calculatedValues.totalAmount.toFixed(2),
          creditGiven: '0'
        }));
      } 
      // If credit exceeds total, adjust credit down and set cash to 0
      else if (creditGiven > calculatedValues.totalAmount) {
        setFormData(prev => ({
          ...prev,
          cashReceived: '0',
          creditGiven: calculatedValues.totalAmount.toFixed(2)
        }));
      }
      // Otherwise, if cash changed, adjust credit to make up the difference
      else if (formData.cashReceived) {
        const newCredit = Math.max(0, calculatedValues.totalAmount - cashReceived);
        setFormData(prev => ({
          ...prev,
          creditGiven: newCredit.toFixed(2)
        }));
      }
      // If credit changed, adjust cash to make up the difference
      else if (formData.creditGiven) {
        const newCash = Math.max(0, calculatedValues.totalAmount - creditGiven);
        setFormData(prev => ({
          ...prev,
          cashReceived: newCash.toFixed(2)
        }));
      }
    }
  }, [formData.cashReceived, formData.creditGiven, calculatedValues.totalAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as keyof SaleFormData;
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
    const newErrors: Partial<Record<keyof SaleFormData, string>> = {};
    
    if (!formData.stationId) {
      newErrors.stationId = 'Station is required';
    }

    if (!formData.nozzleId) {
      newErrors.nozzleId = 'Nozzle is required';
    }

    if (!formData.cumulativeReading) {
      newErrors.cumulativeReading = 'Cumulative reading is required';
    } else if (parseFloat(formData.cumulativeReading) <= calculatedValues.previousReading) {
      newErrors.cumulativeReading = 'Reading must be greater than previous reading';
    }

    const cashReceived = parseFloat(formData.cashReceived || '0');
    const creditGiven = parseFloat(formData.creditGiven || '0');
    
    if (Math.abs((cashReceived + creditGiven) - calculatedValues.totalAmount) > 0.01) {
      newErrors.cashReceived = 'Cash + Credit must equal total amount';
    }

    if (creditGiven > 0 && !formData.creditPartyId) {
      newErrors.creditPartyId = 'Credit party is required when giving credit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        {/* Station & Nozzle Selection */}
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
          <FormControl 
            fullWidth 
            error={!!errors.nozzleId} 
            disabled={!formData.stationId || loading.nozzles || isSubmitting}
          >
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
                  {nozzle.pumpName} - {nozzle.fuelType.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
            {errors.nozzleId && <FormHelperText>{errors.nozzleId}</FormHelperText>}
          </FormControl>
        </Grid>
        
        {/* Readings & Calculations */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Readings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  label="Previous Reading"
                  value={calculatedValues.previousReading.toFixed(2)}
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
                  inputProps={{ step: '0.01', min: calculatedValues.previousReading }}
                  error={!!errors.cumulativeReading}
                  helperText={errors.cumulativeReading}
                  disabled={!formData.nozzleId || isSubmitting}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  label="Sale Volume"
                  value={calculatedValues.saleVolume.toFixed(2)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Payment Details */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Payment</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  label="Fuel Price"
                  value={`$${calculatedValues.fuelPrice.toFixed(2)}`}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  disabled
                  label="Total Amount"
                  value={`$${calculatedValues.totalAmount.toFixed(2)}`}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Cash Received"
                  name="cashReceived"
                  value={formData.cashReceived}
                  onChange={handleChange}
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  error={!!errors.cashReceived}
                  helperText={errors.cashReceived}
                  disabled={!formData.cumulativeReading || isSubmitting}
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
                  inputProps={{ step: '0.01', min: '0' }}
                  error={!!errors.creditGiven}
                  helperText={errors.creditGiven}
                  disabled={!formData.cumulativeReading || isSubmitting}
                />
              </Grid>
              
              {parseFloat(formData.creditGiven) > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.creditPartyId} disabled={isSubmitting}>
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
                          {creditor.partyName} (Balance: ${creditor.runningBalance.toFixed(2)})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.creditPartyId && <FormHelperText>{errors.creditPartyId}</FormHelperText>}
                  </FormControl>
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
          disabled={isSubmitting || !formData.stationId || !formData.nozzleId || !formData.cumulativeReading}
        >
          {isSubmitting ? 'Saving...' : 'Record Sale'}
        </Button>
      </Box>
    </Box>
  );
};

export default SaleForm;
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';

interface NozzleFormData {
  fuelType: string;
  initialReading: string;
}

interface NozzleFormProps {
  initialData?: Partial<NozzleFormData>;
  onSubmit: (data: NozzleFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string;
  isEdit?: boolean;
}

const NozzleForm: React.FC<NozzleFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<NozzleFormData>({
    fuelType: initialData.fuelType || '',
    initialReading: initialData.initialReading || '0',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NozzleFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as keyof NozzleFormData;
    const value = e.target.value as string;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NozzleFormData, string>> = {};
    
    if (!formData.fuelType) {
      newErrors.fuelType = 'Fuel type is required';
    }

    if (!isEdit && (!formData.initialReading || parseFloat(formData.initialReading) < 0)) {
      newErrors.initialReading = 'Valid initial reading is required';
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

  const fuelTypes = ['petrol', 'diesel', 'premium', 'super', 'cng', 'lpg'];

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl 
            fullWidth 
            error={!!errors.fuelType}
            disabled={isEdit || isSubmitting}
          >
            <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
            <Select
              labelId="fuel-type-label"
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              label="Fuel Type"
              onChange={handleChange}
            >
              {fuelTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
            {errors.fuelType && <FormHelperText>{errors.fuelType}</FormHelperText>}
          </FormControl>
        </Grid>
        
        {!isEdit && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              id="initialReading"
              label="Initial Reading"
              name="initialReading"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={formData.initialReading}
              onChange={handleChange}
              error={!!errors.initialReading}
              helperText={errors.initialReading || "Starting meter reading for this nozzle"}
              disabled={isSubmitting}
            />
          </Grid>
        )}
      </Grid>
      
      {submitError && (
        <FormHelperText error sx={{ mt: 2 }}>
          {submitError}
        </FormHelperText>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Nozzle' : 'Add Nozzle'}
        </Button>
      </Box>
    </Box>
  );
};

export default NozzleForm;
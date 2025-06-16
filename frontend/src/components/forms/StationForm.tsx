import React, { useState } from 'react';
import {
  Box,
  TextField,
  Grid,
  Button,
  FormHelperText,
} from '@mui/material';

interface StationFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactPhone: string;
}

interface StationFormProps {
  initialData?: Partial<StationFormData>;
  onSubmit: (data: StationFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string;
}

const StationForm: React.FC<StationFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}) => {
  const [formData, setFormData] = useState<StationFormData>({
    name: initialData.name || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    zip: initialData.zip || '',
    contactPhone: initialData.contactPhone || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof StationFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof StationFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StationFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="name"
            label="Station Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="address"
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            disabled={isSubmitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="city"
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={!!errors.city}
            helperText={errors.city}
            disabled={isSubmitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            id="state"
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            error={!!errors.state}
            helperText={errors.state}
            disabled={isSubmitting}
          />
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            id="zip"
            label="ZIP Code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            error={!!errors.zip}
            helperText={errors.zip}
            disabled={isSubmitting}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="contactPhone"
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
            disabled={isSubmitting}
          />
        </Grid>
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
          {isSubmitting ? 'Saving...' : initialData.name ? 'Update Station' : 'Create Station'}
        </Button>
      </Box>
    </Box>
  );
};

export default StationForm;
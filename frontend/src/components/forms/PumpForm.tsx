import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormHelperText,
  Grid
} from '@mui/material';

interface PumpFormData {
  name: string;
  serialNumber: string;
  installationDate: string;
}

interface PumpFormProps {
  initialData?: Partial<PumpFormData>;
  onSubmit: (data: PumpFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string;
}

const PumpForm: React.FC<PumpFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
}) => {
  const [formData, setFormData] = useState<PumpFormData>({
    name: initialData.name || '',
    serialNumber: initialData.serialNumber || '',
    installationDate: initialData.installationDate || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PumpFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof PumpFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PumpFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Pump name is required';
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
            label="Pump Name"
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
            id="serialNumber"
            label="Serial Number"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            error={!!errors.serialNumber}
            helperText={errors.serialNumber}
            disabled={isSubmitting}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="installationDate"
            label="Installation Date"
            name="installationDate"
            type="date"
            value={formData.installationDate}
            onChange={handleChange}
            error={!!errors.installationDate}
            helperText={errors.installationDate}
            disabled={isSubmitting}
            InputLabelProps={{
              shrink: true,
            }}
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
          {isSubmitting ? 'Saving...' : initialData.name ? 'Update Pump' : 'Add Pump'}
        </Button>
      </Box>
    </Box>
  );
};

export default PumpForm;
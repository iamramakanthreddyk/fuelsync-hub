// frontend/src/components/admin/UserForm.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';

interface Tenant {
  id: string;
  name: string;
}

interface UserFormProps {
  initialData?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    tenantId?: string;
    phone?: string;
    active?: boolean;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function UserForm({ initialData, onSubmit, onCancel, isEdit = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    password: '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    role: initialData?.role || 'employee',
    tenantId: initialData?.tenantId || '',
    phone: initialData?.phone || '',
    active: initialData?.active !== undefined ? initialData.active : true
  });
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingTenants, setLoadingTenants] = useState(false);
  
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        
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
      } finally {
        setLoadingTenants(false);
      }
    };
    
    fetchTenants();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role || !formData.tenantId) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!isEdit && !formData.password) {
      setError('Password is required');
      return;
    }
    
    // If role is owner, check if tenant already has an owner
    if (formData.role === 'owner' && !isEdit) {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        
        const response = await fetch(`/api/admin/users?tenantId=${formData.tenantId}&role=owner`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to check existing owners');
        }
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setError('This tenant already has an owner. Please select a different role or tenant.');
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error('Error checking owners:', err);
        setError(err.message || 'Failed to check existing owners');
        setLoading(false);
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Submit form data
      await onSubmit(formData);
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'An error occurred while saving');
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || (isEdit && initialData?.role === 'owner')}
          />
        </Grid>
        
        {!isEdit && (
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
        )}
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleChange}
              disabled={loading || (isEdit && initialData?.role === 'owner')}
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </Select>
            <FormHelperText>
              {formData.role === 'owner' && 'Full access to tenant features'}
              {formData.role === 'manager' && 'Can manage stations and staff'}
              {formData.role === 'employee' && 'Limited to daily operations'}
            </FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="tenant-label">Tenant</InputLabel>
            <Select
              labelId="tenant-label"
              id="tenantId"
              name="tenantId"
              value={formData.tenantId}
              label="Tenant"
              onChange={handleChange}
              disabled={loading || loadingTenants || isEdit}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
            {loadingTenants && <FormHelperText>Loading tenants...</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="phone"
            label="Phone"
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </Grid>
        
        {isEdit && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="active"
                name="active"
                value={formData.active}
                label="Status"
                onChange={handleChange}
                disabled={loading || (isEdit && initialData?.role === 'owner')}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={onCancel}
          sx={{ mr: 1 }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
}
// frontend/src/pages/admin/settings.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { Save } from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    siteName: 'FuelSync Hub',
    contactEmail: 'support@fuelsync.com',
    maxTenantsPerPlan: {
      basic: 1,
      premium: 5,
      enterprise: 'Unlimited'
    },
    features: {
      enableRegistration: true,
      enableApiAccess: true,
      maintenanceMode: false
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Simulate loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        console.error('Auth check error:', err);
        setError(err.message || 'Authentication error');
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSave = () => {
    // Simulate saving
    alert('Settings saved successfully!');
  };

  const handleChange = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: checked
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <Typography variant="h4" gutterBottom>
        Platform Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="General Settings" />
            <CardContent>
              <TextField
                fullWidth
                label="Site Name"
                margin="normal"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
              <TextField
                fullWidth
                label="Contact Email"
                margin="normal"
                value={settings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Feature Toggles" />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.features.enableRegistration}
                    onChange={(e) => handleFeatureChange('enableRegistration', e.target.checked)}
                  />
                }
                label="Enable Registration"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.features.enableApiAccess}
                    onChange={(e) => handleFeatureChange('enableApiAccess', e.target.checked)}
                  />
                }
                label="Enable API Access"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.features.maintenanceMode}
                    onChange={(e) => handleFeatureChange('maintenanceMode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
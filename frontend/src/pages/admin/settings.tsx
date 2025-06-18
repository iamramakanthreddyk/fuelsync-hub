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
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';

interface TenantLimits {
  stations: number;
  users: number;
}

interface SystemSettings {
  tenantLimits: {
    basic: TenantLimits;
    premium: TenantLimits;
    enterprise: TenantLimits;
  };
  systemMaintenance: {
    enabled: boolean;
    message: string;
    allowedIPs: string[];
  };
}

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<SystemSettings>({
    tenantLimits: {
      basic: { stations: 3, users: 10 },
      premium: { stations: 10, users: 50 },
      enterprise: { stations: -1, users: -1 }
    },
    systemMaintenance: {
      enabled: false,
      message: 'System is under maintenance',
      allowedIPs: []
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      if (data.data) {
        setSettings(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      systemMaintenance: {
        ...settings.systemMaintenance,
        enabled: event.target.checked
      }
    });
  };

  const handleMaintenanceMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      systemMaintenance: {
        ...settings.systemMaintenance,
        message: event.target.value
      }
    });
  };

  const handleAllowedIPsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const ips = event.target.value.split(',').map(ip => ip.trim()).filter(ip => ip);
    setSettings({
      ...settings,
      systemMaintenance: {
        ...settings.systemMaintenance,
        allowedIPs: ips
      }
    });
  };

  const handleTenantLimitChange = (plan: 'basic' | 'premium' | 'enterprise', field: 'stations' | 'users', value: number) => {
    setSettings({
      ...settings,
      tenantLimits: {
        ...settings.tenantLimits,
        [plan]: {
          ...settings.tenantLimits[plan],
          [field]: value
        }
      }
    });
  };

  return (
    <AdminLayout title="Settings">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure system-wide settings and tenant limits
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Tenant Subscription Limits" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">Basic Plan</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Stations"
                        type="number"
                        value={settings.tenantLimits.basic.stations}
                        onChange={(e) => handleTenantLimitChange('basic', 'stations', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Users"
                        type="number"
                        value={settings.tenantLimits.basic.users}
                        onChange={(e) => handleTenantLimitChange('basic', 'users', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6">Premium Plan</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Stations"
                        type="number"
                        value={settings.tenantLimits.premium.stations}
                        onChange={(e) => handleTenantLimitChange('premium', 'stations', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Users"
                        type="number"
                        value={settings.tenantLimits.premium.users}
                        onChange={(e) => handleTenantLimitChange('premium', 'users', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6">Enterprise Plan</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Use -1 for unlimited
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Stations"
                        type="number"
                        value={settings.tenantLimits.enterprise.stations}
                        onChange={(e) => handleTenantLimitChange('enterprise', 'stations', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Max Users"
                        type="number"
                        value={settings.tenantLimits.enterprise.users}
                        onChange={(e) => handleTenantLimitChange('enterprise', 'users', parseInt(e.target.value))}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="System Maintenance" />
            <Divider />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.systemMaintenance.enabled}
                    onChange={handleMaintenanceModeChange}
                  />
                }
                label="Maintenance Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                When enabled, only allowed IPs can access the system
              </Typography>

              <TextField
                fullWidth
                label="Maintenance Message"
                value={settings.systemMaintenance.message}
                onChange={handleMaintenanceMessageChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Allowed IPs (comma separated)"
                value={settings.systemMaintenance.allowedIPs.join(', ')}
                onChange={handleAllowedIPsChange}
                placeholder="127.0.0.1, 192.168.1.1"
                helperText="Leave empty to block all IPs"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}
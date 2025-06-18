// frontend/src/pages/admin/reports/compliance.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress
} from '@mui/material';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function ComplianceReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    // Load tenants
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

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
      setError(err.message || 'Failed to fetch tenants');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (tenantId) {
        params.append('tenantId', tenantId);
      }

      const response = await fetch(`/api/admin/reports/compliance?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch compliance report');
      }

      const data = await response.json();
      setReportData(data.data);
    } catch (err: any) {
      console.error('Error fetching compliance report:', err);
      setError(err.message || 'Failed to fetch compliance report');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getComplianceStatusChip = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <Chip label={status} color="success" />;
      case 'Minor Issues':
        return <Chip label={status} color="warning" />;
      case 'Major Issues':
        return <Chip label={status} color="error" />;
      case 'Critical Issues':
        return <Chip label={status} color="error" variant="outlined" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <AdminLayout title="Compliance Report">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Compliance Report
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor tenant compliance with business rules and subscription limits
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tenant</InputLabel>
              <Select
                value={tenantId}
                label="Tenant"
                onChange={(e) => setTenantId(e.target.value)}
              >
                <MenuItem value="">All Tenants</MenuItem>
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              onClick={fetchReport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {reportData && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Overall Compliance Score
                    </Typography>
                    <Typography 
                      variant="h4"
                      color={getComplianceColor(reportData.summary.overallScore)}
                    >
                      {reportData.summary.overallScore.toFixed(2)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={reportData.summary.overallScore} 
                      color={getComplianceColor(reportData.summary.overallScore) as "success" | "warning" | "error" | "info" | "primary" | "secondary"}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Compliant Tenants
                    </Typography>
                    <Typography variant="h4">
                      {reportData.summary.compliantTenants} / {reportData.summary.totalTenants}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(reportData.summary.compliantTenants / reportData.summary.totalTenants) * 100} 
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Non-Compliant Tenants
                    </Typography>
                    <Typography variant="h4" color="error">
                      {reportData.summary.totalTenants - reportData.summary.compliantTenants}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={((reportData.summary.totalTenants - reportData.summary.compliantTenants) / reportData.summary.totalTenants) * 100} 
                      color="error"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="h5" gutterBottom>
              Tenant Compliance Details
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Subscription</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Issues</TableCell>
                    <TableCell align="center">Stations</TableCell>
                    <TableCell align="center">Users</TableCell>
                    <TableCell align="center">Has Owner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.details.map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{row.tenant_name}</TableCell>
                      <TableCell>{row.subscription_plan}</TableCell>
                      <TableCell align="center">
                        <Typography 
                          color={getComplianceColor(row.compliance.score)}
                          fontWeight="bold"
                        >
                          {row.compliance.score}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getComplianceStatusChip(row.compliance.status)}
                      </TableCell>
                      <TableCell>
                        {row.compliance.issues.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {row.compliance.issues.map((issue: string, i: number) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <Typography color="success.main">No issues</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{row.station_count}</TableCell>
                      <TableCell align="center">{row.user_count}</TableCell>
                      <TableCell align="center">
                        {row.compliance.details.hasOwner ? (
                          <Chip label="Yes" color="success" size="small" />
                        ) : (
                          <Chip label="No" color="error" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </AdminLayout>
  );
}
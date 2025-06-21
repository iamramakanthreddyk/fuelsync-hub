// frontend/src/components/admin/DashboardRecentTenants.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

interface Tenant {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: string;
  status: string;
  createdAt: string;
}

export default function DashboardRecentTenants() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/admin/tenants?limit=5', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }

        const data = await response.json();
        setTenants(data.data || []);
      } catch (err: any) {
        console.error('Error fetching tenants:', err);
        setError(err.message || 'Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [router]);

  const handleViewTenant = (id: string) => {
    router.push(`/admin/tenants/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'primary';
      case 'premium':
        return 'secondary';
      case 'enterprise':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Recent Tenants
        </Typography>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Recent Tenants
        </Typography>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Recent Tenants
        </Typography>
        <Button 
          variant="text" 
          size="small" 
          onClick={() => router.push('/admin/tenants')}
        >
          View All
        </Button>
      </Box>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No tenants found
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tenant.subscriptionPlan} 
                      size="small" 
                      color={getPlanColor(tenant.subscriptionPlan) as "primary" | "secondary" | "info" | "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tenant.status} 
                      size="small" 
                      color={getStatusColor(tenant.status) as "success" | "warning" | "error" | "default"}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(tenant.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      onClick={() => handleViewTenant(tenant.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
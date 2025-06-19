// frontend/src/pages/sales/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useRouter } from 'next/router';
import { authHeader } from '../../utils/authHelper';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError('');
        
        const headers = authHeader();
        if (!headers.Authorization) {
          setError('Authentication required');
          setLoading(false);
          router.push('/login');
          return;
        }
        
        console.log('Using headers:', headers);
        
        const response = await fetch('http://localhost:3001/api/sales', {
          headers
        });
        
        const data = await response.json();
        console.log('Sales data:', data);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Authentication error:', data);
            router.push('/login');
            return;
          }
          throw new Error(data.message || 'Failed to fetch sales');
        }
        
        if (data && Array.isArray(data)) {
          setSales(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setSales(data.data);
        } else {
          console.error('Invalid sales data format:', data);
          setError('Invalid data format received from server');
          setSales([]);
        }
      } catch (err) {
        console.error('Error fetching sales:', err);
        setError(`Error: ${err.message}`);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [router]);

  const handleAddSale = () => {
    router.push('/sales/new');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'cash':
        return 'success';
      case 'card':
        return 'primary';
      case 'credit':
        return 'warning';
      case 'upi':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'posted':
        return 'success';
      case 'voided':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Sales">
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Sales
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddSale}
            >
              New Sale
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : !sales ? (
            <Alert severity="info">No sales available (null data)</Alert>
          ) : !Array.isArray(sales) ? (
            <Alert severity="warning">
              Invalid sales data (expected array, got {typeof sales})
            </Alert>
          ) : sales.length === 0 ? (
            <Alert severity="info">No sales found. Create your first sale to get started.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{formatDate(sale.recorded_at)}</TableCell>
                      <TableCell>{sale.sale_volume?.toFixed(2) || 'N/A'} L</TableCell>
                      <TableCell>${sale.fuel_price?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>${sale.amount?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sale.payment_method || 'Unknown'} 
                          color={getPaymentMethodColor(sale.payment_method)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={sale.status || 'Unknown'} 
                          color={getStatusColor(sale.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SalesPage;
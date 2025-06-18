// frontend/src/pages/sales/index.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Box, 
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SaleList from '../../components/sales/SaleList';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';

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
        
        const response = await api.get('/api/sales');
        console.log('Sales response:', response);
        
        // Add defensive checks for the response format
        if (response.status === 'success' && Array.isArray(response.data)) {
          setSales(response.data);
        } else if (response.data && Array.isArray(response.data)) {
          setSales(response.data);
        } else {
          console.error('Invalid sales data format:', response);
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
  }, []);

  const handleAddSale = () => {
    router.push('/sales/new');
  };

  return (
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
        <SaleList sales={sales} />
      )}
    </Container>
  );
};

export default SalesPage;
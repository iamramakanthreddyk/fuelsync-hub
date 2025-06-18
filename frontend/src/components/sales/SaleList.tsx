// frontend/src/components/sales/SaleList.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { format } from 'date-fns';

interface Sale {
  id: string;
  recorded_at: string;
  sale_volume: number;
  fuel_price: number;
  amount: number;
  payment_method: string;
  status: string;
}

interface SaleListProps {
  sales: Sale[];
}

const SaleList: React.FC<SaleListProps> = ({ sales }) => {
  // Add defensive check for sales
  if (!sales) {
    return <Alert severity="error">No sales data provided</Alert>;
  }

  if (!Array.isArray(sales)) {
    return <Alert severity="error">Invalid sales data (not an array)</Alert>;
  }

  if (sales.length === 0) {
    return <Typography variant="body1">No sales found.</Typography>;
  }

  const getPaymentMethodColor = (method: string) => {
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

  const getStatusColor = (status: string) => {
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
              <TableCell>
                {sale.recorded_at ? format(new Date(sale.recorded_at), 'MMM d, yyyy h:mm a') : 'N/A'}
              </TableCell>
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
  );
};

export default SaleList;
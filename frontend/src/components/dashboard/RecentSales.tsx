import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';

interface Sale {
  id: string;
  recordedAt: string;
  stationName: string;
  fuelType: string;
  saleVolume: number;
  amount: number;
  paymentMethod: string;
  employeeName: string;
}

interface RecentSalesProps {
  sales: Sale[];
  isLoading?: boolean;
}

const RecentSales: React.FC<RecentSalesProps> = ({ sales, isLoading = false }) => {
  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'success';
      case 'credit':
        return 'warning';
      case 'card':
        return 'info';
      case 'upi':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader title="Recent Sales" />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box p={2} textAlign="center">
            <Typography variant="body2">Loading...</Typography>
          </Box>
        ) : sales.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography variant="body2">No recent sales found.</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Station</TableCell>
                <TableCell>Fuel</TableCell>
                <TableCell align="right">Volume</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Employee</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} hover>
                  <TableCell>
                    {new Date(sale.recordedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{sale.stationName}</TableCell>
                  <TableCell>{sale.fuelType.toUpperCase()}</TableCell>
                  <TableCell align="right">{sale.saleVolume?.toFixed(2)}L</TableCell>
                  <TableCell align="right">${sale.amount?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={sale.paymentMethod}
                      size="small"
                      color={getPaymentMethodColor(sale.paymentMethod)}
                    />
                  </TableCell>
                  <TableCell>{sale.employeeName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
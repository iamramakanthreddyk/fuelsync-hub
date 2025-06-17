import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface SalesByFuelType {
  [fuelType: string]: {
    volume: number;
    amount: number;
  };
}

interface SalesByPaymentMethod {
  [method: string]: number;
}

interface DailySale {
  date: string;
  amount: number;
  volume: number;
}

interface SalesReportData {
  totalSales: number;
  totalVolume: number;
  salesByFuelType: SalesByFuelType;
  salesByPaymentMethod: SalesByPaymentMethod;
  dailySales: DailySale[];
}

interface SalesReportProps {
  data: SalesReportData;
  loading?: boolean;
  onExport?: () => void;
  title?: string;
  subtitle?: string;
}

const SalesReport: React.FC<SalesReportProps> = ({
  data,
  loading = false,
  onExport,
  title = 'Sales Report',
  subtitle
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.totalSales === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1">
          No sales data available for the selected period.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {onExport && (
          <Button
            startIcon={<DownloadIcon />}
            onClick={onExport}
            variant="outlined"
            size="small"
          >
            Export
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sales Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Sales
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${data.totalSales?.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Volume
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {data.totalVolume?.toFixed(2)} L
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Sales by Payment Method */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sales by Payment Method
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment Method</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data.salesByPaymentMethod).map(([method, amount]) => (
                    <TableRow key={method}>
                      <TableCell>
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </TableCell>
                      <TableCell align="right">${amount?.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {((amount / data.totalSales) * 100)?.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Sales by Fuel Type */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sales by Fuel Type
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fuel Type</TableCell>
                    <TableCell align="right">Volume (L)</TableCell>
                    <TableCell align="right">Amount ($)</TableCell>
                    <TableCell align="right">Average Price/L</TableCell>
                    <TableCell align="right">% of Total Sales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(data.salesByFuelType).map(([fuelType, data]) => (
                    <TableRow key={fuelType}>
                      <TableCell>{fuelType.toUpperCase()}</TableCell>
                      <TableCell align="right">{data.volume?.toFixed(2)}</TableCell>
                      <TableCell align="right">${data.amount?.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        ${(data.amount / data.volume)?.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {((data.amount / data.totalSales) * 100)?.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        {/* Daily Sales */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Daily Sales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Volume (L)</TableCell>
                    <TableCell align="right">Amount ($)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.dailySales.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>
                        {new Date(day.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">{day.volume?.toFixed(2)}</TableCell>
                      <TableCell align="right">${day.amount?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesReport;
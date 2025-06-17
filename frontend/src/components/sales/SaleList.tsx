import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  CircularProgress,
  Typography,
  TextField,
  Grid,
  Button
} from '@mui/material';
import { 
  Visibility as ViewIcon,
  Block as VoidIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

interface Sale {
  id: string;
  recordedAt: string;
  stationName: string;
  pumpName: string;
  fuelType: string;
  saleVolume: number;
  fuelPrice: number;
  amount: number;
  cashReceived: number;
  creditGiven: number;
  paymentMethod: string;
  creditorName?: string;
  employeeName: string;
  status: string;
}

interface SaleListProps {
  sales: Sale[];
  loading?: boolean;
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onViewSale?: (saleId: string) => void;
  onVoidSale?: (saleId: string) => void;
  canVoidSales?: boolean;
  showFilters?: boolean;
  onFilterChange?: (filters: Record<string, string>) => void;
}

const SaleList: React.FC<SaleListProps> = ({
  sales,
  loading = false,
  total = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onViewSale,
  onVoidSale,
  canVoidSales = false,
  showFilters = false,
  onFilterChange
}) => {
  const [filters, setFilters] = useState({
    stationName: '',
    fuelType: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      stationName: '',
      fuelType: '',
      paymentMethod: '',
      startDate: '',
      endDate: ''
    });
    
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

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
      case 'mixed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'success';
      case 'draft':
        return 'warning';
      case 'voided':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (sales.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1">
          No sales records found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {showFilters && (
        <Paper sx={{ mb: 2, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Filters</Typography>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Box>
          
          {showFilterPanel && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Station"
                  name="stationName"
                  value={filters.stationName}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Fuel Type"
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Payment Method"
                  name="paymentMethod"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" gap={1}>
                  <Button 
                    variant="contained" 
                    onClick={handleApplyFilters}
                    size="small"
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleClearFilters}
                    size="small"
                  >
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date/Time</TableCell>
              <TableCell>Station</TableCell>
              <TableCell>Fuel</TableCell>
              <TableCell align="right">Volume (L)</TableCell>
              <TableCell align="right">Price/L</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} hover>
                <TableCell>
                  {new Date(sale.recordedAt).toLocaleString()}
                </TableCell>
                <TableCell>{sale.stationName}</TableCell>
                <TableCell>{sale.fuelType.toUpperCase()}</TableCell>
                <TableCell align="right">{sale.saleVolume?.toFixed(2)}</TableCell>
                <TableCell align="right">${sale.fuelPrice?.toFixed(2)}</TableCell>
                <TableCell align="right">${sale.amount?.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={sale.paymentMethod}
                    size="small"
                    color={getPaymentMethodColor(sale.paymentMethod)}
                  />
                  {sale.creditGiven > 0 && sale.creditorName && (
                    <Typography variant="caption" display="block">
                      Credit: {sale.creditorName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{sale.employeeName}</TableCell>
                <TableCell>
                  <Chip
                    label={sale.status}
                    size="small"
                    color={getStatusColor(sale.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  {onViewSale && (
                    <IconButton 
                      size="small" 
                      onClick={() => onViewSale(sale.id)}
                      title="View details"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onVoidSale && canVoidSales && sale.status !== 'voided' && (
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => onVoidSale(sale.id)}
                      title="Void sale"
                    >
                      <VoidIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {total > 0 && onPageChange && onRowsPerPageChange && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Box>
  );
};

export default SaleList;

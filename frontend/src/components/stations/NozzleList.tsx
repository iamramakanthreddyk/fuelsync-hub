import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Block as DisableIcon,
  Add as AddIcon 
} from '@mui/icons-material';

interface Nozzle {
  id: string;
  pumpId: string;
  pumpName: string;
  fuelType: string;
  initialReading: number;
  currentReading: number;
  active: boolean;
}

interface NozzleListProps {
  nozzles: Nozzle[];
  pumpId?: string;
  loading?: boolean;
  onAddNozzle: (pumpId: string) => void;
  onEditNozzle: (nozzle: Nozzle) => void;
  onDisableNozzle: (nozzleId: string) => void;
}

const NozzleList: React.FC<NozzleListProps> = ({
  nozzles,
  pumpId,
  loading = false,
  onAddNozzle,
  onEditNozzle,
  onDisableNozzle
}) => {
  // Filter nozzles by pump if pumpId is provided
  const filteredNozzles = pumpId 
    ? nozzles.filter(nozzle => nozzle.pumpId === pumpId)
    : nozzles;
  
  // Group nozzles by pump for better display if no pumpId is specified
  const groupedNozzles = pumpId ? null : filteredNozzles.reduce((acc, nozzle) => {
    if (!acc[nozzle.pumpId]) {
      acc[nozzle.pumpId] = {
        pumpName: nozzle.pumpName,
        nozzles: []
      };
    }
    acc[nozzle.pumpId].nozzles.push(nozzle);
    return acc;
  }, {} as Record<string, { pumpName: string, nozzles: Nozzle[] }>);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (filteredNozzles.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" gutterBottom>
          No nozzles found.
        </Typography>
        {pumpId && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddNozzle(pumpId)}
            sx={{ mt: 2 }}
          >
            Add First Nozzle
          </Button>
        )}
      </Box>
    );
  }

  // Render single pump's nozzles
  if (pumpId) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Nozzles</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddNozzle(pumpId)}
            size="small"
          >
            Add Nozzle
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fuel Type</TableCell>
                <TableCell align="right">Initial Reading</TableCell>
                <TableCell align="right">Current Reading</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNozzles.map((nozzle) => (
                <TableRow key={nozzle.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {nozzle.fuelType.toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{nozzle.initialReading.toFixed(2)}</TableCell>
                  <TableCell align="right">{nozzle.currentReading.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={nozzle.active ? 'Active' : 'Disabled'}
                      color={nozzle.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => onEditNozzle(nozzle)}
                      title="Edit nozzle"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {nozzle.active && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => onDisableNozzle(nozzle.id)}
                        title="Disable nozzle"
                      >
                        <DisableIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
  
  // Render all nozzles grouped by pump
  return (
    <Box>
      <Typography variant="h6" gutterBottom>All Nozzles</Typography>
      
      {Object.entries(groupedNozzles || {}).map(([pumpId, { pumpName, nozzles }]) => (
        <Box key={pumpId} mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {pumpName}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddNozzle(pumpId)}
            >
              Add Nozzle
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fuel Type</TableCell>
                  <TableCell align="right">Initial Reading</TableCell>
                  <TableCell align="right">Current Reading</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nozzles.map((nozzle) => (
                  <TableRow key={nozzle.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {nozzle.fuelType.toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{nozzle.initialReading.toFixed(2)}</TableCell>
                    <TableCell align="right">{nozzle.currentReading.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={nozzle.active ? 'Active' : 'Disabled'}
                        color={nozzle.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => onEditNozzle(nozzle)}
                        title="Edit nozzle"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {nozzle.active && (
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => onDisableNozzle(nozzle.id)}
                          title="Disable nozzle"
                        >
                          <DisableIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

export default NozzleList;
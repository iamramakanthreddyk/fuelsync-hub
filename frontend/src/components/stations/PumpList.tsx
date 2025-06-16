import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon 
} from '@mui/icons-material';

interface Pump {
  id: string;
  name: string;
  serialNumber?: string;
  installationDate?: string;
  nozzlesCount?: number;
}

interface PumpListProps {
  pumps: Pump[];
  loading?: boolean;
  onAddPump: () => void;
  onEditPump: (pump: Pump) => void;
  onDeletePump: (pumpId: string) => void;
  onAddNozzle: (pumpId: string) => void;
  onViewNozzles: (pumpId: string) => void;
}

const PumpList: React.FC<PumpListProps> = ({
  pumps,
  loading = false,
  onAddPump,
  onEditPump,
  onDeletePump,
  onAddNozzle,
  onViewNozzles
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (pumps.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" gutterBottom>
          No pumps found for this station.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddPump}
          sx={{ mt: 2 }}
        >
          Add First Pump
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Pumps</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddPump}
          size="small"
        >
          Add Pump
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        {pumps.map(pump => (
          <Grid item xs={12} sm={6} md={4} key={pump.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {pump.name}
                </Typography>
                
                {pump.serialNumber && (
                  <Typography variant="body2" color="text.secondary">
                    Serial: {pump.serialNumber}
                  </Typography>
                )}
                
                {pump.installationDate && (
                  <Typography variant="body2" color="text.secondary">
                    Installed: {new Date(pump.installationDate).toLocaleDateString()}
                  </Typography>
                )}
                
                <Divider sx={{ my: 1.5 }} />
                
                <Box display="flex" alignItems="center">
                  <Chip
                    label={`${pump.nozzlesCount || 0} Nozzle${(pump.nozzlesCount !== 1) ? 's' : ''}`}
                    color="secondary"
                    size="small"
                    onClick={() => onViewNozzles(pump.id)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => onEditPump(pump)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />}
                  onClick={() => onDeletePump(pump.id)}
                >
                  Delete
                </Button>
                <Button 
                  size="small" 
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => onAddNozzle(pump.id)}
                  sx={{ ml: 'auto' }}
                >
                  Add Nozzle
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PumpList;
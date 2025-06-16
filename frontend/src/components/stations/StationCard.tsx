import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  LocalGasStation as PumpIcon 
} from '@mui/icons-material';

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactPhone: string;
  pumpsCount?: number;
  nozzlesCount?: number;
}

interface StationCardProps {
  station: Station;
  onEdit: (station: Station) => void;
  onDelete: (stationId: string) => void;
  onManage: (stationId: string) => void;
}

const StationCard: React.FC<StationCardProps> = ({ station, onEdit, onDelete, onManage }) => {
  const { id, name, address, city, state, zip, contactPhone, pumpsCount = 0, nozzlesCount = 0 } = station;
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {name}
        </Typography>
        
        {address && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {address}{city ? `, ${city}` : ''}{state ? `, ${state}` : ''} {zip}
          </Typography>
        )}
        
        {contactPhone && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Phone: {contactPhone}
          </Typography>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip 
            icon={<PumpIcon sx={{ fontSize: '0.75rem !important' }} />}
            label={`${pumpsCount} Pump${pumpsCount !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${nozzlesCount} Nozzle${nozzlesCount !== 1 ? 's' : ''}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>
      </CardContent>
      
      <CardActions>
        <Button 
          size="small" 
          startIcon={<EditIcon />}
          onClick={() => onEdit(station)}
        >
          Edit
        </Button>
        <Button 
          size="small" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(id)}
        >
          Delete
        </Button>
        <Button 
          size="small" 
          color="primary"
          onClick={() => onManage(id)}
          sx={{ ml: 'auto' }}
        >
          Manage
        </Button>
      </CardActions>
    </Card>
  );
};

export default StationCard;
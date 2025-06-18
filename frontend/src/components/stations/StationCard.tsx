// frontend/src/components/stations/StationCard.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button, 
  Box,
  Chip,
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon, 
  LocalGasStation as GasIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface Station {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_phone?: string;
  pumps_count?: number;
  active?: boolean;
}

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const router = useRouter();
  
  const handleViewDetails = () => {
    router.push(`/stations/${station.id}`);
  };
  
  const handleEdit = () => {
    router.push(`/stations/${station.id}/edit`);
  };

  // Format address
  const formattedAddress = [
    station.address,
    station.city && station.state ? `${station.city}, ${station.state}` : (station.city || station.state),
    station.zip
  ].filter(Boolean).join(', ');

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {station.name}
          </Typography>
          {station.active !== undefined && (
            <Chip 
              label={station.active ? "Active" : "Inactive"} 
              color={station.active ? "success" : "default"}
              size="small"
            />
          )}
        </Box>
        
        {formattedAddress && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formattedAddress}
            </Typography>
          </Box>
        )}
        
        {station.contact_phone && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Phone: {station.contact_phone}
          </Typography>
        )}
        
        {station.pumps_count !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <GasIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body2">
              {station.pumps_count} {station.pumps_count === 1 ? 'Pump' : 'Pumps'}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          variant="contained" 
          size="small"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Edit
        </Button>
      </CardActions>
    </Card>
  );
};

export default StationCard;
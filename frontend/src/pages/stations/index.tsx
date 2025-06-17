// frontend/src/pages/stations/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/utils/api';
import { ApiResponse, Station } from '@/types/api';

function StationsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact_phone: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  useEffect(() => {
    // Fetch stations
    const fetchStations = async () => {
      try {
        const response = await apiGet<ApiResponse<Station[]>>('/stations');
        
        if (response.status === 'success' && response.data) {
          setStations(response.data);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStations();
  }, []);
  
  const handleOpenDialog = (mode: 'add' | 'edit', station?: Station) => {
    setDialogMode(mode);
    if (mode === 'edit' && station) {
      setCurrentStation(station);
      setFormData({
        name: station.name,
        address: station.address || '',
        city: station.city || '',
        state: station.state || '',
        zip: station.zip || '',
        contact_phone: station.contact_phone || ''
      });
    } else {
      setCurrentStation(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        contact_phone: ''
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    try {
      let response;
      
      if (dialogMode === 'add') {
        response = await apiPost<ApiResponse<Station>>('/stations', formData);
      } else {
        response = await apiPatch<ApiResponse<Station>>(`/stations/${currentStation?.id}`, formData);
      }
      
      if (response.status === 'success' && response.data) {
        // Update stations list
        if (dialogMode === 'add') {
          setStations(prev => [...prev, response.data as Station]);
        } else {
          setStations(prev => prev.map(s => s.id === (response.data as Station).id ? (response.data as Station) : s));
        }
        
        setSnackbar({
          open: true,
          message: `Station ${dialogMode === 'add' ? 'added' : 'updated'} successfully`,
          severity: 'success'
        });
        
        handleCloseDialog();
      }
    } catch (error: any) {
      console.error('Error saving station:', error);
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${dialogMode === 'add' ? 'add' : 'update'} station`,
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) {
      return;
    }
    
    try {
      const response = await apiDelete<ApiResponse<{ success: boolean }>>(`/stations/${id}`);
      
      if (response.status === 'success') {
        // Update stations list
        setStations(prev => prev.filter(s => s.id !== id));
        
        setSnackbar({
          open: true,
          message: 'Station deleted successfully',
          severity: 'success'
        });
      }
    } catch (error: any) {
      console.error('Error deleting station:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete station',
        severity: 'error'
      });
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  if (loading) {
    return (
      <DashboardLayout title="Stations">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Stations">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Your Stations</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Station
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {stations.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="body1" align="center">
                  No stations found. Click the "Add Station" button to create your first station.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          stations.map(station => (
            <Grid item xs={12} sm={6} md={4} key={station.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{station.name}</Typography>
                  {station.address && (
                    <Typography variant="body2" color="textSecondary">
                      {station.address}, {station.city}, {station.state} {station.zip}
                    </Typography>
                  )}
                  {station.contact_phone && (
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Phone: {station.contact_phone}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog('edit', station)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(station.id)}
                  >
                    Delete
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => router.push(`/stations/${station.id}`)}
                  >
                    Manage
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Add/Edit Station Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Station' : 'Edit Station'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Station Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="address"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="state"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="zip"
                  label="ZIP Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <TextField
              margin="normal"
              fullWidth
              id="contact_phone"
              label="Contact Phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add Station' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

// Wrap the stations content with the protected route component
export default function Stations() {
  return (
    <ProtectedRoute requiredRoles={['owner', 'manager']}>
      <StationsContent />
    </ProtectedRoute>
  );
}
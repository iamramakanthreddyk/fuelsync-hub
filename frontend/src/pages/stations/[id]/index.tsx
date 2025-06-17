// frontend/src/pages/stations/[id]/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  LocalGasStation as NozzleIcon 
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contactPhone: string;
}

interface Pump {
  id: string;
  name: string;
  serialNumber: string;
  installationDate: string;
  active: boolean;
}

interface Nozzle {
  id: string;
  pumpId: string;
  fuelType: string;
  initialReading: number;
  currentReading: number;
  active: boolean;
}

interface FuelPrice {
  id: string;
  fuelType: string;
  pricePerUnit: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<Station | null>(null);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [nozzles, setNozzles] = useState<{ [pumpId: string]: Nozzle[] }>({}); // Grouped by pump ID
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);

  // Dialogs state
  const [pumpDialog, setPumpDialog] = useState({
    open: false,
    mode: 'add' as 'add' | 'edit',
    currentPump: null as Pump | null
  });
  const [nozzleDialog, setNozzleDialog] = useState({
    open: false,
    mode: 'add' as 'add' | 'edit',
    pumpId: '',
    currentNozzle: null as Nozzle | null
  });
  const [priceDialog, setPriceDialog] = useState({
    open: false,
    fuelType: ''
  });

  // Form state
  const [pumpForm, setPumpForm] = useState({
    name: '',
    serialNumber: '',
    installationDate: ''
  });
  const [nozzleForm, setNozzleForm] = useState({
    fuelType: '',
    initialReading: ''
  });
  const [priceForm, setPriceForm] = useState({
    pricePerUnit: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fuelTypes = ['petrol', 'diesel', 'premium', 'super', 'cng', 'lpg'];

  useEffect(() => {
    // Only load data if we have an ID
    if (id) {
      fetchStationData();
    }
  }, [id]);

  const fetchStationData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // Fetch station details
      const stationResponse = await fetch(`/api/stations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!stationResponse.ok) {
        throw new Error('Failed to fetch station details');
      }

      const stationData = await stationResponse.json();
      setStation(stationData);

      // Fetch pumps
      const pumpsResponse = await fetch(`/api/stations/${id}/pumps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!pumpsResponse.ok) {
        throw new Error('Failed to fetch pumps');
      }

      const pumpsData = await pumpsResponse.json();
      setPumps(pumpsData);

      // Fetch nozzles for each pump
      const nozzlesMap: { [pumpId: string]: Nozzle[] } = {};

      for (const pump of pumpsData) {
        const nozzlesResponse = await fetch(`/api/pumps/${pump.id}/nozzles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (nozzlesResponse.ok) {
          const nozzlesData = await nozzlesResponse.json();
          nozzlesMap[pump.id] = nozzlesData;
        }
      }

      setNozzles(nozzlesMap);

      // Fetch fuel prices
      const pricesResponse = await fetch(`/api/fuel-prices?stationId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (pricesResponse.ok) {
        const pricesData = await pricesResponse.json();
        setFuelPrices(pricesData);
      }
    } catch (error) {
      console.error('Error fetching station data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load station data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Pump dialog handlers
  const handleOpenPumpDialog = (mode: 'add' | 'edit', pump?: Pump) => {
    if (mode === 'edit' && pump) {
      setPumpForm({
        name: pump.name,
        serialNumber: pump.serialNumber || '',
        installationDate: pump.installationDate || ''
      });
      setPumpDialog({
        open: true,
        mode,
        currentPump: pump
      });
    } else {
      setPumpForm({
        name: '',
        serialNumber: '',
        installationDate: ''
      });
      setPumpDialog({
        open: true,
        mode: 'add',
        currentPump: null
      });
    }
  };

  const handleClosePumpDialog = () => {
    setPumpDialog(prev => ({ ...prev, open: false }));
  };

  const handlePumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPumpForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPump = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      let response;

      if (pumpDialog.mode === 'add') {
        response = await fetch('/api/pumps', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stationId: id,
            ...pumpForm
          })
        });
      } else {
        response = await fetch(`/api/pumps/${pumpDialog.currentPump?.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pumpForm)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save pump');
      }

      const data = await response.json();

      // Update pumps list
      if (pumpDialog.mode === 'add') {
        setPumps(prev => [...prev, data]);
      } else {
        setPumps(prev => prev.map(p => p.id === data.id ? data : p));
      }

      setSnackbar({
        open: true,
        message: `Pump ${pumpDialog.mode === 'add' ? 'added' : 'updated'} successfully`,
        severity: 'success'
      });

      handleClosePumpDialog();
    } catch (error) {
      console.error('Error saving pump:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${pumpDialog.mode === 'add' ? 'add' : 'update'} pump`,
        severity: 'error'
      });
    }
  };

  const handleDeletePump = async (pumpId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!confirm('Are you sure you want to delete this pump?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pumps/${pumpId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete pump');
      }

      // Update pumps list
      setPumps(prev => prev.filter(p => p.id !== pumpId));
      
      // Also remove nozzles associated with this pump
      const updatedNozzles = { ...nozzles };
      delete updatedNozzles[pumpId];
      setNozzles(updatedNozzles);

      setSnackbar({
        open: true,
        message: 'Pump deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting pump:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete pump',
        severity: 'error'
      });
    }
  };

  // Nozzle dialog handlers
  const handleOpenNozzleDialog = (mode: 'add' | 'edit', pumpId: string, nozzle?: Nozzle) => {
    if (mode === 'edit' && nozzle) {
      setNozzleForm({
        fuelType: nozzle.fuelType,
        initialReading: nozzle.initialReading.toString()
      });
      setNozzleDialog({
        open: true,
        mode,
        pumpId,
        currentNozzle: nozzle
      });
    } else {
      setNozzleForm({
        fuelType: '',
        initialReading: '0'
      });
      setNozzleDialog({
        open: true,
        mode: 'add',
        pumpId,
        currentNozzle: null
      });
    }
  };

  const handleCloseNozzleDialog = () => {
    setNozzleDialog(prev => ({ ...prev, open: false }));
  };

  const handleNozzleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNozzleForm(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmitNozzle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      let response;

      if (nozzleDialog.mode === 'add') {
        response = await fetch('/api/nozzles', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pumpId: nozzleDialog.pumpId,
            fuelType: nozzleForm.fuelType,
            initialReading: parseFloat(nozzleForm.initialReading)
          })
        });
      } else {
        response = await fetch(`/api/nozzles/${nozzleDialog.currentNozzle?.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fuelType: nozzleForm.fuelType,
            active: true
          })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save nozzle');
      }

      const data = await response.json();

      // Update nozzles list
      if (nozzleDialog.mode === 'add') {
        setNozzles(prev => ({
          ...prev,
          [nozzleDialog.pumpId]: [...(prev[nozzleDialog.pumpId] || []), data]
        }));
      } else {
        setNozzles(prev => ({
          ...prev,
          [nozzleDialog.pumpId]: prev[nozzleDialog.pumpId].map(n => 
            n.id === data.id ? data : n
          )
        }));
      }

      setSnackbar({
        open: true,
        message: `Nozzle ${nozzleDialog.mode === 'add' ? 'added' : 'updated'} successfully`,
        severity: 'success'
      });

      handleCloseNozzleDialog();

      // Refresh fuel prices if we added a new fuel type
      if (nozzleDialog.mode === 'add') {
        fetchStationData();
      }
    } catch (error) {
      console.error('Error saving nozzle:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${nozzleDialog.mode === 'add' ? 'add' : 'update'} nozzle`,
        severity: 'error'
      });
    }
  };

  const handleDeleteNozzle = async (nozzleId: string, pumpId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!confirm('Are you sure you want to disable this nozzle?')) {
      return;
    }

    try {
      const response = await fetch(`/api/nozzles/${nozzleId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          active: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to disable nozzle');
      }

      // Update nozzles list
      setNozzles(prev => ({
        ...prev,
        [pumpId]: prev[pumpId].map(n => 
          n.id === nozzleId ? { ...n, active: false } : n
        )
      }));

      setSnackbar({
        open: true,
        message: 'Nozzle disabled successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error disabling nozzle:', error);
      setSnackbar({
        open: true,
        message: 'Failed to disable nozzle',
        severity: 'error'
      });
    }
  };

  // Price dialog handlers
  const handleOpenPriceDialog = (fuelType: string) => {
    // Find current price
    const currentPrice = fuelPrices.find(
      p => p.fuelType === fuelType && (!p.effectiveTo || new Date(p.effectiveTo) > new Date())
    );

    setPriceForm({
      pricePerUnit: currentPrice ? currentPrice.pricePerUnit.toString() : ''
    });

    setPriceDialog({
      open: true,
      fuelType
    });
  };

  const handleClosePriceDialog = () => {
    setPriceDialog(prev => ({ ...prev, open: false }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPrice = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // First, mark any active price as inactive
      const currentPrice = fuelPrices.find(
        p => p.fuelType === priceDialog.fuelType && (!p.effectiveTo || new Date(p.effectiveTo) > new Date())
      );

      if (currentPrice) {
        await fetch(`/api/fuel-prices/${currentPrice.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            effectiveTo: new Date().toISOString()
          })
        });
      }

      // Then add the new price
      const response = await fetch('/api/fuel-prices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stationId: id,
          fuelType: priceDialog.fuelType,
          pricePerUnit: parseFloat(priceForm.pricePerUnit),
          effectiveFrom: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update fuel price');
      }

      // Refresh fuel prices
      fetchStationData();

      setSnackbar({
        open: true,
        message: 'Fuel price updated successfully',
        severity: 'success'
      });

      handleClosePriceDialog();
    } catch (error) {
      console.error('Error updating fuel price:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update fuel price',
        severity: 'error'
      });
    }
  };

  // Utility function to get active price for a fuel type
  const getActivePriceForFuelType = (fuelType: string) => {
    const price = fuelPrices.find(
      p => p.fuelType === fuelType && (!p.effectiveTo || new Date(p.effectiveTo) > new Date())
    );
    return price ? price.pricePerUnit : null;
  };

  // Utility function to get all unique fuel types in use
  const getActiveFuelTypes = () => {
    const types = new Set<string>();
    
    Object.values(nozzles).forEach(pumpNozzles => {
      pumpNozzles.forEach(nozzle => {
        if (nozzle.active) {
          types.add(nozzle.fuelType);
        }
      });
    });
    
    return Array.from(types);
  };

  if (loading) {
    return (
      <DashboardLayout title="Station Details">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!station) {
    return (
      <DashboardLayout title="Station Not Found">
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Station not found or you don't have access.</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => router.push('/stations')}
          >
            Back to Stations
          </Button>
        </Paper>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={station.name}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="station management tabs">
            <Tab label="Overview" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Pumps & Nozzles" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Fuel Prices" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Station Information</Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {station.address}, {station.city}, {station.state} {station.zip}
              </Typography>
              {station.contactPhone && (
                <Typography variant="body1">
                  <strong>Contact:</strong> {station.contactPhone}
                </Typography>
              )}
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push(`/stations/${station.id}/edit`)}
              >
                Edit Station Details
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Quick Stats</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h4">{pumps.length}</Typography>
                    <Typography variant="body2">Pumps</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h4">
                      {Object.values(nozzles).reduce((acc, curr) => acc + curr.filter(n => n.active).length, 0)}
                    </Typography>
                    <Typography variant="body2">Active Nozzles</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Fuel Types</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {getActiveFuelTypes().map(type => (
                        <Box 
                          key={type}
                          sx={{ 
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <NozzleIcon sx={{ mr: 1, fontSize: 'small' }} />
                          <Typography variant="body2">
                            {type.charAt(0).toUpperCase() + type.slice(1)}: ${getActivePriceForFuelType(type)??.toFixed(2) || 'Not set'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Pumps & Nozzles Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">Pumps & Nozzles</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenPumpDialog('add')}
            >
              Add Pump
            </Button>
          </Box>

          {pumps.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                No pumps added yet. Click the "Add Pump" button to create your first pump.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {pumps.map((pump) => (
                <Grid item xs={12} sm={6} md={4} key={pump.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {pump.name}
                      </Typography>
                      {pump.serialNumber && (
                        <Typography variant="body2" color="textSecondary">
                          Serial: {pump.serialNumber}
                        </Typography>
                      )}
                      {pump.installationDate && (
                        <Typography variant="body2" color="textSecondary">
                          Installed: {new Date(pump.installationDate).toLocaleDateString()}
                        </Typography>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" gutterBottom>
                        Nozzles
                      </Typography>

                      {nozzles[pump.id]?.filter(n => n.active).length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                          No active nozzles
                        </Typography>
                      ) : (
                        nozzles[pump.id]?.filter(n => n.active).map((nozzle) => (
                          <Box
                            key={nozzle.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1,
                              mb: 1,
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                <strong>{nozzle.fuelType.toUpperCase()}</strong>
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Reading: {nozzle.currentReading?.toFixed(2)}
                              </Typography>
                            </Box>
                            <Box>
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => handleOpenNozzleDialog('edit', pump.id, nozzle)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteNozzle(nozzle.id, pump.id)}
                              >
                                Disable
                              </Button>
                            </Box>
                          </Box>
                        ))
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenPumpDialog('edit', pump)}
                      >
                        Edit Pump
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeletePump(pump.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenNozzleDialog('add', pump.id)}
                      >
                        Add Nozzle
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Fuel Prices Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>Fuel Prices</Typography>
            <Typography variant="body2" color="textSecondary">
              Set the current prices for each fuel type. Prices will apply to all sales recorded after they are set.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {getActiveFuelTypes().length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No fuel types configured yet. Add nozzles to pumps first.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              getActiveFuelTypes().map((fuelType) => {
                const activePrice = getActivePriceForFuelType(fuelType);
                return (
                  <Grid item xs={12} sm={6} md={4} key={fuelType}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {fuelType.toUpperCase()}
                        </Typography>
                        <Typography variant="h4" color="primary" gutterBottom>
                          ${activePrice??.toFixed(2) || 'Not set'}
                        </Typography>
                        {activePrice && (
                          <Typography variant="body2" color="textSecondary">
                            Last updated: {
                              fuelPrices.find(p =>
                                p.fuelType === fuelType &&
                                p.pricePerUnit === activePrice &&
                                (!p.effectiveTo || new Date(p.effectiveTo) > new Date())
                              )?.effectiveFrom
                              ? new Date(fuelPrices.find(p =>
                                  p.fuelType === fuelType &&
                                  p.pricePerUnit === activePrice &&
                                  (!p.effectiveTo || new Date(p.effectiveTo) > new Date())
                                )?.effectiveFrom as string).toLocaleString()
                              : 'Unknown'
                            }
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenPriceDialog(fuelType)}
                        >
                          Update Price
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Pump Dialog */}
      <Dialog open={pumpDialog.open} onClose={handleClosePumpDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {pumpDialog.mode === 'add' ? 'Add New Pump' : 'Edit Pump'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Pump Name"
              name="name"
              value={pumpForm.name}
              onChange={handlePumpChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="serialNumber"
              label="Serial Number"
              name="serialNumber"
              value={pumpForm.serialNumber}
              onChange={handlePumpChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="installationDate"
              label="Installation Date"
              name="installationDate"
              type="date"
              value={pumpForm.installationDate}
              onChange={handlePumpChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePumpDialog}>Cancel</Button>
          <Button onClick={handleSubmitPump} variant="contained">
            {pumpDialog.mode === 'add' ? 'Add Pump' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nozzle Dialog */}
      <Dialog open={nozzleDialog.open} onClose={handleCloseNozzleDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {nozzleDialog.mode === 'add' ? 'Add New Nozzle' : 'Edit Nozzle'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
              <Select
                labelId="fuel-type-label"
                id="fuelType"
                name="fuelType"
                value={nozzleForm.fuelType}
                label="Fuel Type"
                onChange={handleNozzleChange}
                disabled={nozzleDialog.mode === 'edit'}
              >
                {fuelTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {nozzleDialog.mode === 'add' && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="initialReading"
                label="Initial Reading"
                name="initialReading"
                type="number"
                value={nozzleForm.initialReading}
                onChange={handleNozzleChange}
                helperText="Initial meter reading of this nozzle"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNozzleDialog}>Cancel</Button>
          <Button onClick={handleSubmitNozzle} variant="contained">
            {nozzleDialog.mode === 'add' ? 'Add Nozzle' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price Dialog */}
      <Dialog open={priceDialog.open} onClose={handleClosePriceDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update {priceDialog.fuelType.toUpperCase()} Price
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="pricePerUnit"
              label="Price per Unit"
              name="pricePerUnit"
              type="number"
              inputProps={{ step: "0.01" }}
              value={priceForm.pricePerUnit}
              onChange={handlePriceChange}
              helperText="Enter the new price per unit"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePriceDialog}>Cancel</Button>
          <Button onClick={handleSubmitPrice} variant="contained">
            Update Price
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

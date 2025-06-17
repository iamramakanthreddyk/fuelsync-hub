// frontend/src/pages/settings/index.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Check as CheckIcon,
  LocalGasStation as StationIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  Payments as PaymentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../utils/auth';
import { apiGet, apiPatch } from '../../utils/api';

interface PlanFeature {
  name: string;
  basic: boolean | string | number;
  premium: boolean | string | number;
  enterprise: boolean | string | number;
}

const planFeatures: PlanFeature[] = [
  { name: 'Stations', basic: '1', premium: '5', enterprise: 'Unlimited' },
  { name: 'Pumps per Station', basic: '4', premium: '8', enterprise: 'Unlimited' },
  { name: 'Nozzles per Pump', basic: '4', premium: '6', enterprise: 'Unlimited' },
  { name: 'Users', basic: '5', premium: '20', enterprise: 'Unlimited' },
  { name: 'Data Export', basic: false, premium: true, enterprise: true },
  { name: 'Advanced Reports', basic: false, premium: true, enterprise: true },
  { name: 'API Access', basic: false, premium: false, enterprise: true },
  { name: 'Support', basic: 'Email', premium: 'Priority', enterprise: 'Dedicated' }
];

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  
  useEffect(() => {
    if (authLoading) return;
    
    const fetchSettings = async () => {
      try {
        const data = await apiGet('/settings');
        setTenantSettings(data);
        
        // Initialize profile data
        if (user) {
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [authLoading, user]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    setSaveLoading(true);
    
    try {
      await apiPatch(`/users/${user?.id}`, profileData);
      
      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setShowProfileDialog(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const getPlanChipColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'default';
      case 'premium': return 'primary';
      case 'enterprise': return 'secondary';
      default: return 'default';
    }
  };
  
  if (authLoading || loading) {
    return (
      <DashboardLayout title="Settings">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Settings">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Profile</Typography>
              <Button 
                startIcon={<EditIcon />} 
                size="small"
                onClick={() => setShowProfileDialog(true)}
              >
                Edit
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {user && (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Typography>
                {user.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Phone: {user.phone}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Subscription</Typography>
              <Chip 
                label={user?.planType?.toUpperCase() || 'BASIC'} 
                color={getPlanChipColor(user?.planType || 'basic')} 
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Your current plan gives you access to the following features:
            </Typography>
            
            <Grid container spacing={3} mb={4}>
              {planFeatures.map((feature) => (
                <Grid item xs={12} sm={6} key={feature.name}>
                  <Box display="flex" alignItems="center">
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {typeof feature[user?.planType || 'basic'] === 'boolean' ? (
                        feature[user?.planType || 'basic'] ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <CheckIcon color="disabled" fontSize="small" />
                        )
                      ) : (
                        <CheckIcon color="success" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature.name} 
                      secondary={typeof feature[user?.planType || 'basic'] !== 'boolean' 
                        ? feature[user?.planType || 'basic'] 
                        : undefined} 
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            <Typography variant="body2" paragraph>
              Need more features? Contact our sales team to upgrade your plan.
            </Typography>
            <Button variant="outlined" color="primary">
              Upgrade Plan
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Company Settings</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardHeader title="General" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Timezone: {tenantSettings?.timezone || 'UTC'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Currency: {tenantSettings?.currency || 'USD'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date Format: {tenantSettings?.dateFormat || 'YYYY-MM-DD'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardHeader title="Display" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Theme: {tenantSettings?.theme || 'Light'}
                    </Typography>
                    <Button size="small" sx={{ mt: 1 }}>
                      Change Theme
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined">
                  <CardHeader title="Billing" />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Current Plan: {user?.planType?.toUpperCase() || 'BASIC'}
                    </Typography>
                    <Button size="small" color="primary">
                      Manage Billing
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfileDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveProfile} 
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
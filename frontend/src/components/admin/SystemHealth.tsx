import { Paper, Typography, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';

interface SystemHealth {
  db_size_mb: number;
  total_users: number;
  total_stations: number;
  today_sales: number;
}

export default function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    apiGet('/admin/system-health').then((data) => setHealth(data as SystemHealth));
  }, []);

  if (!health) return null;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>System Health</Typography>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="subtitle2">Database Size</Typography>
          <Typography>{Math.round(health.db_size_mb)}MB</Typography>
        </Grid>
        {/* Add other health metrics */}
      </Grid>
    </Paper>
  );
}

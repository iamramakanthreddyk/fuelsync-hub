import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import PumpList from '../../../../components/stations/PumpList';
import { api } from '../../../../utils/api';
import { authHeader } from '../../../../utils/authHelper';
import toast from 'react-hot-toast';

const PumpListPage = () => {
  const router = useRouter();
  const { id } = router.query; // station id
  const [pumps, setPumps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = authHeader();
        const data = await api.get(`/stations/${id}/pumps`, { headers });
        setPumps(data.data || data);
      } catch (err: any) {
        setError(err.message || 'Failed to load pumps');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const refresh = () => {
    if (id) {
      setLoading(true);
      api.get(`/stations/${id}/pumps`, { headers: authHeader() })
        .then((data) => setPumps(data.data || data))
        .catch(() => toast.error('Failed to refresh pumps'))
        .finally(() => setLoading(false));
    }
  };

  const handleAddPump = () => router.push(`/stations/${id}/pumps/new`);
  const handleEditPump = (pump: any) => router.push(`/stations/${id}/pumps/${pump.id}/edit`);
  const handleDeletePump = async (pumpId: string) => {
    if (!confirm('Delete this pump?')) return;
    try {
      await api.delete(`/pumps/${pumpId}`, { headers: authHeader() });
      toast.success('Pump deleted');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };
  const handleAddNozzle = (pumpId: string) => router.push(`/stations/${id}/pumps/${pumpId}/nozzles/new`);
  const handleViewNozzles = (pumpId: string) => router.push(`/stations/${id}/pumps/${pumpId}/nozzles`);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Pumps">
        <Container sx={{ mt: 4 }}>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h4">Pumps</Typography>
            <button onClick={handleAddPump}>Add Pump</button>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <PumpList
              pumps={pumps}
              onAddPump={handleAddPump}
              onEditPump={handleEditPump}
              onDeletePump={handleDeletePump}
              onAddNozzle={handleAddNozzle}
              onViewNozzles={handleViewNozzles}
            />
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default PumpListPage;

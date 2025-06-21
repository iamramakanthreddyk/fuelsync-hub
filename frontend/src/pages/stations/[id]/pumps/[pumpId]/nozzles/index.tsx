import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import DashboardLayout from '../../../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../../../components/auth/ProtectedRoute';
import NozzleList from '../../../../../../components/stations/NozzleList';
import { api } from '../../../../../../utils/api';
import { authHeader } from '../../../../../../utils/authHelper';
import toast from 'react-hot-toast';

const NozzleListPage = () => {
  const router = useRouter();
  const { id, pumpId } = router.query as { id: string; pumpId: string };
  const [nozzles, setNozzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pumpId) return;
    const load = async () => {
      try {
        const data = await api.get(`/pumps/${pumpId}/nozzles`, { headers: authHeader() });
        setNozzles(data.data || data);
      } catch (err: any) {
        setError(err.message || 'Failed to load nozzles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pumpId]);

  const refresh = () => {
    if (!pumpId) return;
    setLoading(true);
    api.get(`/pumps/${pumpId}/nozzles`, { headers: authHeader() })
      .then((d) => setNozzles(d.data || d))
      .catch(() => toast.error('Refresh failed'))
      .finally(() => setLoading(false));
  };

  const handleAdd = () => router.push(`/stations/${id}/pumps/${pumpId}/nozzles/new`);
  const handleEdit = (nozzle: any) => router.push(`/stations/${id}/pumps/${pumpId}/nozzles/${nozzle.id}/edit`);
  const handleDisable = async (nozzleId: string) => {
    if (!confirm('Disable this nozzle?')) return;
    try {
      await api.delete(`/nozzles/${nozzleId}`, { headers: authHeader() });
      toast.success('Nozzle disabled');
      refresh();
    } catch (err:any) {
      toast.error('Failed to disable');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Nozzles">
        <Container sx={{ mt:4 }}>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h4">Nozzles</Typography>
            <button onClick={handleAdd}>Add Nozzle</button>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <NozzleList nozzles={nozzles} onAddNozzle={handleAdd} onEditNozzle={handleEdit} onDisableNozzle={handleDisable} />
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NozzleListPage;

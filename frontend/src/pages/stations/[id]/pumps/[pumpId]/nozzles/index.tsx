import React from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import DashboardLayout from '../../../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../../../components/auth/ProtectedRoute';
import NozzleList from '../../../../../../components/stations/NozzleList';
import { useNozzles } from '../../../../../../hooks';
import { api } from '../../../../../../utils/api';
import { authHeader } from '../../../../../../utils/authHelper';
import toast from 'react-hot-toast';

const NozzleListPage = () => {
  const router = useRouter();
  const { id, pumpId } = router.query as { id: string; pumpId: string };
  const { data: nozzles = [], isLoading, isError, error, refetch } = useNozzles(pumpId);

  const refresh = () => {
    refetch();
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
          {isLoading ? (
            <Box display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : (
            <NozzleList nozzles={nozzles} onAddNozzle={handleAdd} onEditNozzle={handleEdit} onDisableNozzle={handleDisable} />
          )}
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NozzleListPage;

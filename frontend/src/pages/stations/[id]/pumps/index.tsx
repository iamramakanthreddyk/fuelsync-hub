import React from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import PumpList from '../../../../components/stations/PumpList';
import { usePumps } from '../../../../hooks';
import { api } from '../../../../utils/api';
import { authHeader } from '../../../../utils/authHelper';
import toast from 'react-hot-toast';

const PumpListPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: pumps = [], isLoading, isError, error, refetch } = usePumps(id);

  const refresh = () => {
    refetch();
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
          {isLoading ? (
            <Box display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
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

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';
import DashboardLayout from '../../../../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../../../../components/auth/ProtectedRoute';
import NozzleForm from '../../../../../../../components/forms/NozzleForm';
import { api } from '../../../../../../../utils/api';
import { authHeader } from '../../../../../../../utils/authHelper';
import toast from 'react-hot-toast';

const EditNozzlePage = () => {
  const router = useRouter();
  const { id, pumpId, nozzleId } = router.query as { id: string; pumpId: string; nozzleId: string };
  const [nozzle, setNozzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!nozzleId) return;
    api.get(`/nozzles/${nozzleId}`, { headers: authHeader() })
      .then((d) => setNozzle(d.data || d))
      .catch((err) => setError(err.message || 'Failed to load nozzle'))
      .finally(() => setLoading(false));
  }, [nozzleId]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await api.patch(`/nozzles/${nozzleId}`, data, { headers: authHeader() });
      toast.success('Nozzle updated');
      router.push(`/stations/${id}/pumps/${pumpId}/nozzles`);
    } catch (err: any) {
      setError(err.message || 'Failed to update nozzle');
      toast.error('Failed to update nozzle');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Edit Nozzle">
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Edit Nozzle">
        <Container sx={{ mt:4 }}>
          <Box mb={2}><Typography variant="h4">Edit Nozzle</Typography></Box>
          <Paper sx={{ p:2 }}>
            <NozzleForm
              initialData={nozzle}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/stations/${id}/pumps/${pumpId}/nozzles`)}
              isSubmitting={submitting}
              submitError={error}
              isEdit
            />
          </Paper>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EditNozzlePage;

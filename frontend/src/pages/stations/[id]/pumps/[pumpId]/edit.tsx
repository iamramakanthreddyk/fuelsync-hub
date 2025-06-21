import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../../components/auth/ProtectedRoute';
import PumpForm from '../../../../../components/forms/PumpForm';
import { api } from '../../../../../utils/api';
import { authHeader } from '../../../../../utils/authHelper';
import toast from 'react-hot-toast';

const EditPumpPage = () => {
  const router = useRouter();
  const { id, pumpId } = router.query as { id: string; pumpId: string };
  const [pump, setPump] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pumpId) return;
    api.get(`/pumps/${pumpId}`, { headers: authHeader() })
      .then((data) => setPump(data.data || data))
      .catch((err) => setError(err.message || 'Failed to load pump'))
      .finally(() => setLoading(false));
  }, [pumpId]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await api.patch(`/pumps/${pumpId}`, data, { headers: authHeader() });
      toast.success('Pump updated');
      router.push(`/stations/${id}/pumps`);
    } catch (err: any) {
      setError(err.message || 'Failed to update pump');
      toast.error('Failed to update pump');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Edit Pump">
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Edit Pump">
        <Container sx={{ mt: 4 }}>
          <Box mb={2}><Typography variant="h4">Edit Pump</Typography></Box>
          <Paper sx={{ p:2 }}>
            <PumpForm
              initialData={pump}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/stations/${id}/pumps`)}
              isSubmitting={submitting}
              submitError={error}
            />
          </Paper>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EditPumpPage;

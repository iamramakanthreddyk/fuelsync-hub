import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Paper } from '@mui/material';
import DashboardLayout from '../../../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../../../components/auth/ProtectedRoute';
import NozzleForm from '../../../../../../components/forms/NozzleForm';
import { api } from '../../../../../../utils/api';
import { authHeader } from '../../../../../../utils/authHelper';
import toast from 'react-hot-toast';

const NewNozzlePage = () => {
  const router = useRouter();
  const { id, pumpId } = router.query as { id: string; pumpId: string };
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await api.post('/nozzles', { ...data, pump_id: pumpId }, { headers: authHeader() });
      toast.success('Nozzle created');
      router.push(`/stations/${id}/pumps/${pumpId}/nozzles`);
    } catch (err: any) {
      setError(err.message || 'Failed to create nozzle');
      toast.error('Failed to create nozzle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Add Nozzle">
        <Container sx={{ mt:4 }}>
          <Box mb={2}><Typography variant="h4">Add Nozzle</Typography></Box>
          <Paper sx={{ p:2 }}>
            <NozzleForm
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/stations/${id}/pumps/${pumpId}/nozzles`)}
              isSubmitting={submitting}
              submitError={error}
            />
          </Paper>
        </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NewNozzlePage;

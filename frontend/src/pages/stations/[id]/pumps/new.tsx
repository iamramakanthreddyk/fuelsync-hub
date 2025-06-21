import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Box, Paper } from '@mui/material';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import PumpForm from '../../../../components/forms/PumpForm';
import { api } from '../../../../utils/api';
import { authHeader } from '../../../../utils/authHelper';
import toast from 'react-hot-toast';

const NewPumpPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await api.post('/pumps', { ...data, station_id: id }, { headers: authHeader() });
      toast.success('Pump created');
      router.push(`/stations/${id}/pumps`);
    } catch (err: any) {
      setError(err.message || 'Failed to create pump');
      toast.error('Failed to create pump');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Add Pump">
        <Container sx={{ mt: 4 }}>
          <Box mb={2}>
            <Typography variant="h4">Add Pump</Typography>
          </Box>
          <Paper sx={{ p: 2 }}>
            <PumpForm
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

export default NewPumpPage;

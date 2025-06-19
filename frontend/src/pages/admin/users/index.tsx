// frontend/src/pages/admin/users/index.tsx
import { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          first_name: 'John',
          last_name: 'Owner',
          email: 'owner@demofuel.com',
          role: 'owner',
          tenant_name: 'Demo Company',
          active: true
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Manager',
          email: 'manager@demofuel.com',
          role: 'manager',
          tenant_name: 'Demo Company',
          active: true
        },
        {
          id: '3',
          first_name: 'Bob',
          last_name: 'Employee',
          email: 'employee@demofuel.com',
          role: 'employee',
          tenant_name: 'Demo Company',
          active: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Users">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Users">
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'owner' ? 'primary' : user.role === 'manager' ? 'secondary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.tenant_name}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.active ? 'Active' : 'Inactive'} 
                    color={user.active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminLayout>
  );
}
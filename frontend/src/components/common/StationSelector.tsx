// frontend/src/components/common/StationSelector.tsx
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, FormHelperText } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { Station } from '../../types/api';
import { useAuth } from '../../context/AuthProvider';

interface StationSelectorProps {
  value: string;
  onChange?: (event: SelectChangeEvent<string>) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

interface StationSelectorState {
  stations: Station[];
  loading: boolean;
  error: string | null;
}

const StationSelector: React.FC<StationSelectorProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  label = 'Station',
}) => {
  const [state, setState] = useState<StationSelectorState>({
    stations: [],
    loading: true,
    error: null,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        if (!token) {
          setState(prev => ({ ...prev, loading: false, error: 'Authentication required' }));
          return;
        }

        console.log('Fetching stations...');
        const response = await fetch('/api/stations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching stations:', errorData);
          setState(prev => ({
            ...prev,
            loading: false,
            error: `Failed to fetch stations: ${errorData.message || response.statusText}`,
          }));
          return;
        }

        const data = await response.json();
        console.log('Stations data:', data);

        if (data.status === 'success' && Array.isArray(data.data)) {
          setState({ stations: data.data, loading: false, error: null });
        } else if (data.data && Array.isArray(data.data)) {
          setState({ stations: data.data, loading: false, error: null });
        } else {
          console.error('Invalid stations data format:', data);
          setState({ stations: [], loading: false, error: 'Invalid data format received from server' });
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
        const message = err instanceof Error ? `Error: ${err.message}` : 'Unknown error';
        setState({ stations: [], loading: false, error: message });
      }
    };

    fetchStations();
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (onChange) {
      onChange(event);
    }
  };

  const { stations, loading, error } = state;

  return (
    <FormControl fullWidth required={required} disabled={disabled || loading} error={!!error}>
      <InputLabel id="station-select-label">{label}</InputLabel>
      <Select
        labelId="station-select-label"
        id="station-select"
        value={value || ''}
        label={label}
        onChange={handleChange}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading stations...
          </MenuItem>
        ) : error ? (
          <MenuItem disabled>Error loading stations</MenuItem>
        ) : !stations ? (
          <MenuItem disabled>No stations available (null data)</MenuItem>
        ) : !Array.isArray(stations) ? (
          <MenuItem disabled>No stations available (invalid data type: {typeof stations})</MenuItem>
        ) : stations.length === 0 ? (
          <MenuItem disabled>No stations available (empty array)</MenuItem>
        ) : (
          stations.map((station) => (
            <MenuItem key={station.id} value={station.id}>
              {station.name}
            </MenuItem>
          ))
        )}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
};

export default StationSelector;
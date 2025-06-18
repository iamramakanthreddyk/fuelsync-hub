// frontend/src/components/common/StationSelector.jsx
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, FormHelperText } from '@mui/material';
import { getToken } from '../../utils/authHelper';

const StationSelector = ({ value, onChange, required = false, disabled = false, label = "Station" }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        console.log('Fetching stations...');
        const response = await fetch('/api/stations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching stations:', errorData);
          setError(`Failed to fetch stations: ${errorData.message || response.statusText}`);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Stations data:', data);
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          setStations(data.data);
        } else if (data.data && Array.isArray(data.data)) {
          setStations(data.data);
        } else {
          console.error('Invalid stations data format:', data);
          setError('Invalid data format received from server');
          setStations([]);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError(`Error: ${err.message}`);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleChange = (event) => {
    if (onChange) {
      onChange(event);
    }
  };

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
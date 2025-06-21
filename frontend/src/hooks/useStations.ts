import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { authHeader } from '../utils/authHelper';

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const data = await api.get('/stations', { headers: authHeader() });
      return (data as any).data ?? data;
    }
  });
}

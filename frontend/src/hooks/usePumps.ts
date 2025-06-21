import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { authHeader } from '../utils/authHelper';

export function usePumps(stationId?: string | string[]) {
  return useQuery({
    queryKey: ['pumps', stationId],
    enabled: Boolean(stationId),
    queryFn: async () => {
      if (!stationId) return [];
      const data = await api.get(`/stations/${stationId}/pumps`, { headers: authHeader() });
      return (data as any).data ?? data;
    }
  });
}

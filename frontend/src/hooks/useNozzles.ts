import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { authHeader } from '../utils/authHelper';

export function useNozzles(pumpId?: string | string[]) {
  return useQuery({
    queryKey: ['nozzles', pumpId],
    enabled: Boolean(pumpId),
    queryFn: async () => {
      if (!pumpId) return [];
      const data = await api.get(`/pumps/${pumpId}/nozzles`, { headers: authHeader() });
      return (data as any).data ?? data;
    }
  });
}

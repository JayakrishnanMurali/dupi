import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/types';
import type { GenerateMockDataParams } from '@/lib/api/types';

// Generate mock data (GET)
export function useMockData(endpointId: string, count?: number) {
  return useQuery({
    queryKey: queryKeys.mockData.generate(endpointId, count),
    queryFn: () => apiClient.generateMockData({ endpointId, count }),
    enabled: !!endpointId,
    staleTime: 0, // Always fresh since mock data should be regenerated
    gcTime: 0, // Don't cache mock data
  });
}

// Generate mock data mutation (for manual triggering)
export function useGenerateMockData() {
  return useMutation({
    mutationFn: (params: GenerateMockDataParams) => apiClient.generateMockData(params),
  });
}

// Generate mock data via POST
export function useGenerateMockDataPost() {
  return useMutation({
    mutationFn: (params: GenerateMockDataParams) => apiClient.generateMockDataPost(params),
  });
}
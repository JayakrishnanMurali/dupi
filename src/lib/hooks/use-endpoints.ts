import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/types";
import type {
  CreateEndpointParams,
  UpdateEndpointParams,
  DeleteEndpointParams,
} from "@/lib/api/types";

// Get all endpoints for a project
export function useProjectEndpoints(projectId: string) {
  return useQuery({
    queryKey: queryKeys.endpoints.byProject(projectId),
    queryFn: () => apiClient.getProjectEndpoints(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single endpoint
export function useEndpoint(endpointId: string) {
  return useQuery({
    queryKey: queryKeys.endpoints.detail(endpointId),
    queryFn: () => apiClient.getEndpoint(endpointId),
    enabled: !!endpointId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create endpoint mutation
export function useCreateEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateEndpointParams) =>
      apiClient.createEndpoint(params),
    onSuccess: (data, variables) => {
      // Invalidate project endpoints to refetch
      void queryClient.invalidateQueries({
        queryKey: queryKeys.endpoints.byProject(variables.project_id),
      });
      // Invalidate project detail to update endpoint count
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.project_id),
      });
      // Invalidate projects list to update stats
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

// Update endpoint mutation
export function useUpdateEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateEndpointParams) =>
      apiClient.updateEndpoint(params),
    onSuccess: (data, variables) => {
      // Update the specific endpoint in cache
      queryClient.setQueryData(
        queryKeys.endpoints.detail(variables.endpointId),
        data,
      );
      // If we have project_id, invalidate project endpoints
      if (data.project_id) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.endpoints.byProject(data.project_id),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.project_id),
        });
      }
      // Invalidate projects list to update stats
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

// Delete endpoint mutation
export function useDeleteEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteEndpointParams) =>
      apiClient.deleteEndpoint(params),
    onSuccess: (_, variables) => {
      // Remove the endpoint from cache
      queryClient.removeQueries({
        queryKey: queryKeys.endpoints.detail(variables.endpointId),
      });
      // If we have project_id, invalidate project endpoints
      if (variables.project_id) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.endpoints.byProject(variables.project_id),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(variables.project_id),
        });
      }
      // Invalidate projects list to update stats
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}
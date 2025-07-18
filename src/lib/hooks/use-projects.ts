import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/types";
import type {
  CreateProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@/lib/api/types";

// Get all projects with stats
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.lists(),
    queryFn: () => apiClient.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled since we want to fetch projects when available
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) errors
      if (error instanceof Error && "status" in error && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Get single project
export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateProjectParams) =>
      apiClient.createProject(params),
    onSuccess: () => {
      // Invalidate projects list to refetch
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateProjectParams) =>
      apiClient.updateProject(params),
    onSuccess: (data, variables) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        queryKeys.projects.detail(variables.projectId),
        data,
      );
      // Invalidate projects list to refetch
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteProjectParams) =>
      apiClient.deleteProject(params),
    onSuccess: (_, variables) => {
      // Remove the project from cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(variables.projectId),
      });
      // Invalidate projects list to refetch
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

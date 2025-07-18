import type { 
  Project, 
  Endpoint,
  CreateProjectRequest, 
  UpdateProjectRequest,
  CreateEndpointRequest,
  UpdateEndpointRequest,
  ProjectListResponse,
  DashboardStats
} from '@/lib/supabase/types';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface MockDataResponse {
  success: boolean;
  data: unknown;
  timestamp: string;
  metadata?: {
    endpoint_id: string;
    project_id: string;
    generated_count: number;
    interface_name?: string;
  };
}

// Request types for projects
export interface CreateProjectParams {
  name: string;
  description?: string;
}

export interface UpdateProjectParams {
  projectId: string;
  updates: UpdateProjectRequest;
}

export interface DeleteProjectParams {
  projectId: string;
}

// Request types for endpoints
export interface CreateEndpointParams {
  project_id: string;
  name: string;
  description?: string;
  interface_code: string;
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  expected_status_codes?: number[];
  expiration_hours?: number;
}

export interface UpdateEndpointParams {
  endpointId: string;
  updates: UpdateEndpointRequest;
}

export interface DeleteEndpointParams {
  endpointId: string;
  project_id?: string; // Optional for cache invalidation
}

export interface GenerateMockDataParams {
  endpointId: string;
  count?: number;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Query keys
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  endpoints: {
    all: ['endpoints'] as const,
    lists: () => [...queryKeys.endpoints.all, 'list'] as const,
    byProject: (projectId: string) => [...queryKeys.endpoints.lists(), 'project', projectId] as const,
    details: () => [...queryKeys.endpoints.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.endpoints.details(), id] as const,
  },
  mockData: {
    all: ['mockData'] as const,
    generate: (endpointId: string, count?: number) => 
      [...queryKeys.mockData.all, 'generate', endpointId, count] as const,
  },
} as const;
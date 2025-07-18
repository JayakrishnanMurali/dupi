import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/lib/supabase/types';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ProjectListResponse {
  projects: Project[];
  stats: {
    total: number;
    active: number;
    expired: number;
    inactive: number;
  };
}

export interface MockDataResponse {
  success: boolean;
  data: unknown;
  timestamp: string;
  metadata?: {
    project_id: string;
    generated_count: number;
    interface_name?: string;
  };
}

// Request types
export interface CreateProjectParams {
  name: string;
  description?: string;
  interface_code: string;
  http_method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  expected_status_codes?: number[];
  expiration_hours?: number;
}

export interface UpdateProjectParams {
  projectId: string;
  updates: UpdateProjectRequest;
}

export interface DeleteProjectParams {
  projectId: string;
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
  mockData: {
    all: ['mockData'] as const,
    generate: (endpointId: string, count?: number) => 
      [...queryKeys.mockData.all, 'generate', endpointId, count] as const,
  },
} as const;
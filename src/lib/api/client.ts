import type {
  ApiResponse,
  CreateProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  CreateEndpointParams,
  UpdateEndpointParams,
  DeleteEndpointParams,
  GenerateMockDataParams,
  MockDataResponse,
} from './types';
import { ApiError } from './types';
import type { 
  Project, 
  Endpoint, 
  ProjectListResponse, 
  ProjectWithEndpoints 
} from '@/lib/supabase/types';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Let the server-side API handle authentication via cookies
    // No need to manually add Authorization header for server requests
    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        error.error ?? `HTTP ${response.status}`,
        response.status,
        error
      );
    }

    return response.json();
  }

  // Projects API
  async getProjects(): Promise<ProjectListResponse> {
    const response = await this.request<ApiResponse<ProjectListResponse>>('/api/projects');
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch projects', 500);
    }
    return response.data;
  }

  async getProject(projectId: string): Promise<ProjectWithEndpoints> {
    const response = await this.request<ApiResponse<ProjectWithEndpoints>>(`/api/projects/${projectId}`);
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch project', 500);
    }
    return response.data;
  }

  async createProject(params: CreateProjectParams): Promise<Project> {
    const response = await this.request<ApiResponse<Project>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (!response.success || !response.data) {
      throw new ApiError('Failed to create project', 500);
    }
    return response.data;
  }

  async updateProject(params: UpdateProjectParams): Promise<Project> {
    const response = await this.request<ApiResponse<Project>>(`/api/projects/${params.projectId}`, {
      method: 'PUT',
      body: JSON.stringify(params.updates),
    });
    if (!response.success || !response.data) {
      throw new ApiError('Failed to update project', 500);
    }
    return response.data;
  }

  async deleteProject(params: DeleteProjectParams): Promise<void> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/projects/${params.projectId}`, {
      method: 'DELETE',
    });
    if (!response.success) {
      throw new ApiError('Failed to delete project', 500);
    }
  }

  // Endpoints API
  async getProjectEndpoints(projectId: string): Promise<Endpoint[]> {
    const response = await this.request<ApiResponse<Endpoint[]>>(`/api/projects/${projectId}/endpoints`);
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch project endpoints', 500);
    }
    return response.data;
  }

  async getEndpoint(endpointId: string): Promise<Endpoint> {
    const response = await this.request<ApiResponse<Endpoint>>(`/api/endpoints/${endpointId}`);
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch endpoint', 500);
    }
    return response.data;
  }

  async createEndpoint(params: CreateEndpointParams): Promise<Endpoint> {
    const response = await this.request<ApiResponse<Endpoint>>(`/api/projects/${params.project_id}/endpoints`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (!response.success || !response.data) {
      throw new ApiError('Failed to create endpoint', 500);
    }
    return response.data;
  }

  async updateEndpoint(params: UpdateEndpointParams): Promise<Endpoint> {
    const response = await this.request<ApiResponse<Endpoint>>(`/api/endpoints/${params.endpointId}`, {
      method: 'PUT',
      body: JSON.stringify(params.updates),
    });
    if (!response.success || !response.data) {
      throw new ApiError('Failed to update endpoint', 500);
    }
    return response.data;
  }

  async deleteEndpoint(params: DeleteEndpointParams): Promise<void> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/endpoints/${params.endpointId}`, {
      method: 'DELETE',
    });
    if (!response.success) {
      throw new ApiError('Failed to delete endpoint', 500);
    }
  }

  // Mock Data API
  async generateMockData(params: GenerateMockDataParams): Promise<unknown> {
    const url = `/api/mock/${params.endpointId}${params.count ? `?count=${params.count}` : ''}`;
    const response = await this.request<MockDataResponse>(url);
    if (!response.success) {
      throw new ApiError('Failed to generate mock data', 500);
    }
    return response.data;
  }

  async generateMockDataPost(params: GenerateMockDataParams): Promise<unknown> {
    const response = await this.request<MockDataResponse>(`/api/mock/${params.endpointId}`, {
      method: 'POST',
      body: JSON.stringify({ count: params.count }),
    });
    if (!response.success) {
      throw new ApiError('Failed to generate mock data', 500);
    }
    return response.data;
  }
}

export const apiClient = new ApiClient();
import { createClient } from '@/lib/supabase/client';
import type {
  ApiResponse,
  ProjectListResponse,
  CreateProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  GenerateMockDataParams,
  MockDataResponse,
} from './types';
import { ApiError } from './types';
import type { Project } from '@/lib/supabase/types';

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
        error.error || `HTTP ${response.status}`,
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

  async getProject(projectId: string): Promise<Project> {
    const response = await this.request<ApiResponse<Project>>(`/api/projects/${projectId}`);
    if (!response.success || !response.data) {
      throw new ApiError('Failed to fetch project', 404);
    }
    return response.data;
  }

  async createProject(params: CreateProjectParams): Promise<Project> {
    const response = await this.request<ApiResponse<Project>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (!response.success || !response.data) {
      throw new ApiError('Failed to create project', 400);
    }
    return response.data;
  }

  async updateProject({ projectId, updates }: UpdateProjectParams): Promise<Project> {
    const response = await this.request<ApiResponse<Project>>(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.success || !response.data) {
      throw new ApiError('Failed to update project', 400);
    }
    return response.data;
  }

  async deleteProject({ projectId }: DeleteProjectParams): Promise<void> {
    const response = await this.request<ApiResponse<{ message: string }>>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!response.success) {
      throw new ApiError('Failed to delete project', 400);
    }
  }

  // Mock Data API
  async generateMockData({ endpointId, count }: GenerateMockDataParams): Promise<unknown> {
    const url = count 
      ? `/api/mock/${endpointId}?count=${count}`
      : `/api/mock/${endpointId}`;
    
    const response = await this.request<MockDataResponse>(url);
    if (!response.success) {
      throw new ApiError('Failed to generate mock data', 400);
    }
    return response.data;
  }

  async generateMockDataPost({ endpointId, count }: GenerateMockDataParams): Promise<unknown> {
    const response = await this.request<MockDataResponse>(`/api/mock/${endpointId}`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
    if (!response.success) {
      throw new ApiError('Failed to generate mock data', 400);
    }
    return response.data;
  }
}

export const apiClient = new ApiClient();
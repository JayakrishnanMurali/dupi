import { createServiceClient } from './server';
import { InterfaceParser } from '../dupi/interface-parser';
import { MockGenerator } from '../dupi/mock-generator';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectWithSettings,
  Database,
} from './types';

export class SupabaseProjectService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
  }

  async createProject(
    userId: string,
    request: CreateProjectRequest
  ): Promise<Project> {
    // Validate TypeScript interface
    try {
      InterfaceParser.parseInterface(request.interface_code);
    } catch (error) {
      throw new Error(`Invalid TypeScript interface: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate unique endpoint ID
    const { data: endpointId, error: endpointError } = await this.supabase
      .rpc('generate_endpoint_id');

    if (endpointError) {
      throw new Error('Failed to generate endpoint ID');
    }

    const expirationHours = request.expiration_hours ?? 24;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

    const projectData: ProjectInsert = {
      user_id: userId,
      name: request.name,
      description: request.description,
      interface_code: request.interface_code,
      endpoint_id: endpointId,
      http_method: request.http_method ?? 'GET',
      expected_status_codes: request.expected_status_codes ?? [200],
      expires_at: expiresAt,
      status: 'active',
    };

    const { data, error } = await this.supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    // Create default project settings
    await this.supabase
      .from('project_settings')
      .insert({
        project_id: data.id,
        mock_data_count: 1,
        rate_limit_per_minute: 100,
        enable_analytics: true,
        custom_headers: {},
      });

    return data;
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async getProjectByEndpointId(endpointId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('endpoint_id', endpointId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  }

  async updateProject(
    projectId: string,
    userId: string,
    updates: UpdateProjectRequest
  ): Promise<Project | null> {
    // Validate TypeScript interface if provided
    if (updates.interface_code) {
      try {
        InterfaceParser.parseInterface(updates.interface_code);
      } catch (error) {
        throw new Error(`Invalid TypeScript interface: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const updateData: ProjectUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('projects')
      .update({ status: 'inactive' })
      .eq('id', projectId)
      .eq('user_id', userId);

    return !error;
  }

  async generateMockResponse(endpointId: string, count?: number): Promise<unknown> {
    const project = await this.getProjectByEndpointId(endpointId);
    
    if (!project) {
      throw new Error('Project not found or expired');
    }

    const parsedInterface = InterfaceParser.parseInterface(project.interface_code);
    
    if (count && count > 1) {
      return MockGenerator.generateMultipleRecords(parsedInterface, count);
    }

    return MockGenerator.generateMockData(parsedInterface);
  }

  async logApiUsage(
    projectId: string,
    userId: string,
    requestMethod: string,
    requestPath: string,
    responseStatus: number,
    responseTimeMs?: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('api_usage_logs')
        .insert({
          project_id: projectId,
          user_id: userId,
          request_method: requestMethod,
          request_path: requestPath,
          response_status: responseStatus,
          response_time_ms: responseTimeMs,
          user_agent: userAgent,
          ip_address: ipAddress,
        });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to log API usage:', error);
    }
  }

  async getProjectStats(userId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    inactive: number;
  }> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('status, expires_at')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch project stats: ${error.message}`);
    }

    const now = new Date();
    let active = 0;
    let expired = 0;
    let inactive = 0;

    for (const project of data || []) {
      if (project.status === 'inactive') {
        inactive++;
      } else if (project.status === 'active' && new Date(project.expires_at) > now) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      total: data?.length || 0,
      active,
      expired,
      inactive,
    };
  }

  async getProjectWithSettings(projectId: string): Promise<ProjectWithSettings | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        project_settings (*)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async updateExpiredProjects(): Promise<void> {
    await this.supabase.rpc('update_expired_projects');
  }

  async cleanupExpiredProjects(): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_expired_projects');
    
    if (error) {
      console.error('Failed to cleanup expired projects:', error);
      return 0;
    }

    return data || 0;
  }
}
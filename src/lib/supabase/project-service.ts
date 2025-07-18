import { createServiceClient } from './server';
import { InterfaceParser } from '../dupi/interface-parser';
import { MockGenerator } from '../dupi/mock-generator';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  CreateProjectRequest,
  UpdateProjectRequest,
  Endpoint,
  EndpointInsert,
  EndpointUpdate,
  CreateEndpointRequest,
  UpdateEndpointRequest,
  ProjectWithEndpoints,
  ProjectWithStats,
  DashboardStats,
  ProjectListResponse,
  Database,
} from './types';

export class SupabaseProjectService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
  }

  // Project methods
  async createProject(
    userId: string,
    request: CreateProjectRequest
  ): Promise<Project> {
    const projectData: ProjectInsert = {
      user_id: userId,
      name: request.name,
      description: request.description,
    };

    const { data, error } = await this.supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return data;
  }

  async getProjectWithEndpoints(projectId: string): Promise<ProjectWithEndpoints | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        endpoints (
          *,
          endpoint_settings (*)
        )
      `)
      .eq('id', projectId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get project with endpoints: ${error.message}`);
    }

    return data;
  }

  async getUserProjects(userId: string): Promise<ProjectWithStats[]> {
    const { data: projects, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        endpoints (
          id,
          status,
          expires_at
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }

    // Transform data to include stats
    const projectsWithStats: ProjectWithStats[] = projects.map(project => {
      const endpoints = project.endpoints || [];
      const now = new Date();
      
      const stats = {
        total_endpoints: endpoints.length,
        active_endpoints: endpoints.filter(e => 
          e.status === 'active' && new Date(e.expires_at) > now
        ).length,
        expired_endpoints: endpoints.filter(e => 
          e.status === 'expired' || new Date(e.expires_at) <= now
        ).length,
        inactive_endpoints: endpoints.filter(e => e.status === 'inactive').length,
      };

      const { endpoints: _, ...projectData } = project;
      return { ...projectData, stats };
    });

    return projectsWithStats;
  }

  async updateProject(
    projectId: string,
    userId: string,
    request: UpdateProjectRequest
  ): Promise<Project> {
    const updateData: ProjectUpdate = {
      ...request,
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
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    // Soft delete by setting status to 'archived'
    const { error } = await this.supabase
      .from('projects')
      .update({ status: 'archived' })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    return true;
  }

  // Endpoint methods
  async createEndpoint(
    userId: string,
    request: CreateEndpointRequest
  ): Promise<Endpoint> {
    // Validate TypeScript interface
    try {
      InterfaceParser.parseInterface(request.interface_code);
    } catch (error) {
      throw new Error(`Invalid TypeScript interface: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Verify user owns the project
    const project = await this.getProject(request.project_id);
    if (!project) {
      throw new Error('Project not found');
    }

    const { data: projectOwner, error: ownerError } = await this.supabase
      .from('projects')
      .select('user_id')
      .eq('id', request.project_id)
      .single();

    if (ownerError || projectOwner?.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this project');
    }

    // Generate unique endpoint ID
    const generateEndpointId = (): string => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let endpointId = generateEndpointId();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure the endpoint ID is unique
    while (attempts < maxAttempts) {
      const { data: existing, error: checkError } = await this.supabase
        .from('endpoints')
        .select('id')
        .eq('endpoint_id', endpointId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Not found, so this ID is unique
        break;
      } else if (checkError) {
        throw new Error(`Failed to check endpoint ID uniqueness: ${checkError.message}`);
      } else {
        // ID exists, generate a new one
        endpointId = generateEndpointId();
        attempts++;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique endpoint ID after maximum attempts');
    }

    const expirationHours = request.expiration_hours ?? 24;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

    const endpointData: EndpointInsert = {
      project_id: request.project_id,
      name: request.name,
      description: request.description,
      interface_code: request.interface_code,
      endpoint_id: endpointId,
      http_method: request.http_method ?? 'GET',
      expected_status_codes: request.expected_status_codes ?? [200],
      expires_at: expiresAt,
    };

    const { data, error } = await this.supabase
      .from('endpoints')
      .insert(endpointData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create endpoint: ${error.message}`);
    }

    return data;
  }

  async getEndpoint(endpointId: string): Promise<Endpoint | null> {
    const { data, error } = await this.supabase
      .from('endpoints')
      .select('*')
      .eq('endpoint_id', endpointId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get endpoint: ${error.message}`);
    }

    return data;
  }

  async getProjectEndpoints(projectId: string): Promise<Endpoint[]> {
    const { data, error } = await this.supabase
      .from('endpoints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get project endpoints: ${error.message}`);
    }

    return data;
  }

  async updateEndpoint(
    endpointId: string,
    userId: string,
    request: UpdateEndpointRequest
  ): Promise<Endpoint> {
    // Validate TypeScript interface if provided
    if (request.interface_code) {
      try {
        InterfaceParser.parseInterface(request.interface_code);
      } catch (error) {
        throw new Error(`Invalid TypeScript interface: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Verify user owns the endpoint through project ownership
    const { data: endpoint, error: endpointError } = await this.supabase
      .from('endpoints')
      .select(`
        id,
        projects!inner (
          user_id
        )
      `)
      .eq('id', endpointId)
      .single();

    if (endpointError || endpoint?.projects?.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this endpoint');
    }

    const updateData: EndpointUpdate = {
      ...request,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('endpoints')
      .update(updateData)
      .eq('id', endpointId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update endpoint: ${error.message}`);
    }

    return data;
  }

  async deleteEndpoint(endpointId: string, userId: string): Promise<boolean> {
    // Verify user owns the endpoint through project ownership
    const { data: endpoint, error: endpointError } = await this.supabase
      .from('endpoints')
      .select(`
        id,
        projects!inner (
          user_id
        )
      `)
      .eq('id', endpointId)
      .single();

    if (endpointError || endpoint?.projects?.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this endpoint');
    }

    // Soft delete by setting status to 'inactive'
    const { error } = await this.supabase
      .from('endpoints')
      .update({ status: 'inactive' })
      .eq('id', endpointId);

    if (error) {
      throw new Error(`Failed to delete endpoint: ${error.message}`);
    }

    return true;
  }

  // Statistics and dashboard methods
  async getProjectStats(userId: string): Promise<DashboardStats> {
    // Get project counts
    const { data: projects, error: projectsError } = await this.supabase
      .from('projects')
      .select('id, status')
      .eq('user_id', userId);

    if (projectsError) {
      throw new Error(`Failed to get project stats: ${projectsError.message}`);
    }

    // Get endpoint counts
    const { data: endpoints, error: endpointsError } = await this.supabase
      .from('endpoints')
      .select(`
        id,
        status,
        expires_at,
        projects!inner (
          user_id
        )
      `)
      .eq('projects.user_id', userId);

    if (endpointsError) {
      throw new Error(`Failed to get endpoint stats: ${endpointsError.message}`);
    }

    // Get API usage counts
    const { count: totalApiCalls, error: totalCallsError } = await this.supabase
      .from('api_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalCallsError) {
      throw new Error(`Failed to get API call stats: ${totalCallsError.message}`);
    }

    const { count: todayApiCalls, error: todayCallsError } = await this.supabase
      .from('api_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (todayCallsError) {
      throw new Error(`Failed to get today's API call stats: ${todayCallsError.message}`);
    }

    const now = new Date();
    const activeEndpoints = endpoints.filter(e => 
      e.status === 'active' && new Date(e.expires_at) > now
    );
    const expiredEndpoints = endpoints.filter(e => 
      e.status === 'expired' || new Date(e.expires_at) <= now
    );
    const inactiveEndpoints = endpoints.filter(e => e.status === 'inactive');

    return {
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status === 'active').length,
      archived_projects: projects.filter(p => p.status === 'archived').length,
      total_endpoints: endpoints.length,
      active_endpoints: activeEndpoints.length,
      expired_endpoints: expiredEndpoints.length,
      inactive_endpoints: inactiveEndpoints.length,
      total_api_calls: totalApiCalls ?? 0,
      api_calls_today: todayApiCalls ?? 0,
    };
  }

  // Mock data generation
  async generateMockData(endpointId: string, count?: number): Promise<unknown> {
    const endpoint = await this.getEndpoint(endpointId);
    if (!endpoint) {
      throw new Error('Endpoint not found or expired');
    }

    try {
      const parsedInterface = InterfaceParser.parseInterface(endpoint.interface_code);
      const mockData = MockGenerator.generateMockData(parsedInterface, count);
      return mockData;
    } catch (error) {
      throw new Error(`Failed to generate mock data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility methods
  async logApiUsage(
    endpointId: string,
    projectId: string,
    userId: string,
    requestMethod: string,
    requestPath: string,
    responseStatus: number,
    responseTimeMs?: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('api_usage_logs')
      .insert({
        endpoint_id: endpointId,
        project_id: projectId,
        user_id: userId,
        request_method: requestMethod,
        request_path: requestPath,
        response_status: responseStatus,
        response_time_ms: responseTimeMs,
        user_agent: userAgent,
        ip_address: ipAddress,
      });

    if (error) {
      console.error('Failed to log API usage:', error);
      // Don't throw error for logging failures
    }
  }

  async cleanupExpiredEndpoints(): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_expired_endpoints');
    
    if (error) {
      throw new Error(`Failed to cleanup expired endpoints: ${error.message}`);
    }

    return data ?? 0;
  }
}
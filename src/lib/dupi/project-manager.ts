import type { ApiProject, CreateProjectRequest, MockApiConfig } from './types';
import { InterfaceParser } from './interface-parser';
import { MockGenerator } from './mock-generator';

export class ProjectManager {
  private projects = new Map<string, ApiProject>();
  private config: MockApiConfig;

  constructor(config: MockApiConfig) {
    this.config = config;
    this.cleanupExpiredProjects();
    setInterval(() => this.cleanupExpiredProjects(), 60000);
  }

  createProject(request: CreateProjectRequest): ApiProject {
    try {
      InterfaceParser.parseInterface(request.interfaceCode);
    } catch (error) {
      throw new Error(`Invalid TypeScript interface: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const projectId = this.generateProjectId();
    const endpoint = `/api/mock/${projectId}`;
    const expirationHours = request.expirationHours ?? this.config.defaultExpirationHours;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    const project: ApiProject = {
      id: projectId,
      name: request.name,
      description: request.description,
      interfaceCode: request.interfaceCode,
      endpoint,
      method: request.method ?? 'GET',
      expectedStatusCodes: request.expectedStatusCodes ?? [200],
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    this.projects.set(projectId, project);
    return project;
  }

  getProject(projectId: string): ApiProject | undefined {
    const project = this.projects.get(projectId);
    if (!project || !project.isActive || project.expiresAt < new Date()) {
      return undefined;
    }
    return project;
  }

  updateProject(projectId: string, updates: Partial<ApiProject>): ApiProject | undefined {
    const project = this.projects.get(projectId);
    if (!project?.isActive) {
      return undefined;
    }

    if (updates.interfaceCode) {
      try {
        InterfaceParser.parseInterface(updates.interfaceCode);
      } catch (error) {
        throw new Error(`Invalid TypeScript interface: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };

    this.projects.set(projectId, updatedProject);
    return updatedProject;
  }

  deactivateProject(projectId: string): boolean {
    const project = this.projects.get(projectId);
    if (!project) {
      return false;
    }

    project.isActive = false;
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    return true;
  }

  generateMockResponse(projectId: string, count?: number): unknown {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found or expired');
    }

    const parsedInterface = InterfaceParser.parseInterface(project.interfaceCode);
    
    if (count && count > 1) {
      return MockGenerator.generateMultipleRecords(parsedInterface, count);
    }

    return MockGenerator.generateMockData(parsedInterface);
  }

  listActiveProjects(): ApiProject[] {
    const now = new Date();
    return Array.from(this.projects.values())
      .filter(project => project.isActive && project.expiresAt > now);
  }

  private generateProjectId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private cleanupExpiredProjects(): void {
    const now = new Date();
    const expiredProjectIds: string[] = [];

    for (const [projectId, project] of this.projects.entries()) {
      if (project.expiresAt < now) {
        expiredProjectIds.push(projectId);
      }
    }

    for (const projectId of expiredProjectIds) {
      this.projects.delete(projectId);
    }
  }

  getProjectStats(): { total: number; active: number; expired: number } {
    const now = new Date();
    let active = 0;
    let expired = 0;

    for (const project of this.projects.values()) {
      if (project.isActive && project.expiresAt > now) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      total: this.projects.size,
      active,
      expired,
    };
  }
}
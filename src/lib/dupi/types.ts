export interface ApiProject {
  id: string;
  name: string;
  description?: string;
  interfaceCode: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  expectedStatusCodes: number[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  interfaceCode: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  expectedStatusCodes?: number[];
  expirationHours?: number;
}

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  timestamp: string;
}

export interface MockApiConfig {
  baseUrl: string;
  defaultExpirationHours: number;
  maxProjectsPerUser?: number;
}
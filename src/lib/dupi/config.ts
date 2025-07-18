export interface ApiEndpointConfig {
  mockUrl?: string;
  realUrl?: string;
  useMock: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface DupiClientConfig {
  baseUrl: string;
  defaultTimeout: number;
  defaultHeaders: Record<string, string>;
  endpoints: Record<string, ApiEndpointConfig>;
}

export class DupiClient {
  private config: DupiClientConfig;

  constructor(config: DupiClientConfig) {
    this.config = config;
  }

  async request<T = unknown>(
    endpointName: string,
    options?: {
      method?: string;
      body?: unknown;
      params?: Record<string, string>;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const endpoint = this.config.endpoints[endpointName];
    if (!endpoint) {
      throw new Error(`Endpoint "${endpointName}" not configured`);
    }

    const url = endpoint.useMock ? endpoint.mockUrl : endpoint.realUrl;
    if (!url) {
      throw new Error(`No ${endpoint.useMock ? 'mock' : 'real'} URL configured for endpoint "${endpointName}"`);
    }

    const finalUrl = options?.params ? this.addQueryParams(url, options.params) : url;
    
    const requestOptions: RequestInit = {
      method: options?.method ?? 'GET',
      headers: {
        ...this.config.defaultHeaders,
        ...endpoint.headers,
        ...options?.headers,
      },
      signal: AbortSignal.timeout(endpoint.timeout ?? this.config.defaultTimeout),
    };

    if (options?.body) {
      requestOptions.body = JSON.stringify(options.body);
      requestOptions.headers = {
        ...requestOptions.headers,
        'Content-Type': 'application/json',
      };
    }

    const response = await fetch(finalUrl, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as T;
  }

  updateEndpoint(endpointName: string, updates: Partial<ApiEndpointConfig>): void {
    if (!this.config.endpoints[endpointName]) {
      throw new Error(`Endpoint "${endpointName}" not found`);
    }

    this.config.endpoints[endpointName] = {
      ...this.config.endpoints[endpointName],
      ...updates,
    };
  }

  switchToProduction(endpointName?: string): void {
    if (endpointName) {
      this.updateEndpoint(endpointName, { useMock: false });
    } else {
      Object.keys(this.config.endpoints).forEach(name => {
        this.config.endpoints[name]!.useMock = false;
      });
    }
  }

  switchToMock(endpointName?: string): void {
    if (endpointName) {
      this.updateEndpoint(endpointName, { useMock: true });
    } else {
      Object.keys(this.config.endpoints).forEach(name => {
        this.config.endpoints[name]!.useMock = true;
      });
    }
  }

  getEndpointConfig(endpointName: string): ApiEndpointConfig | undefined {
    return this.config.endpoints[endpointName];
  }

  listEndpoints(): string[] {
    return Object.keys(this.config.endpoints);
  }

  private addQueryParams(url: string, params: Record<string, string>): string {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    return urlObj.toString();
  }
}

export function createDupiClient(config: DupiClientConfig): DupiClient {
  return new DupiClient(config);
}

export function generateConfig(endpoints: Record<string, { mockUrl: string; realUrl?: string }>): DupiClientConfig {
  const endpointConfigs: Record<string, ApiEndpointConfig> = {};
  
  Object.entries(endpoints).forEach(([name, urls]) => {
    endpointConfigs[name] = {
      mockUrl: urls.mockUrl,
      realUrl: urls.realUrl,
      useMock: true,
      timeout: 10000,
    };
  });

  return {
    baseUrl: '',
    defaultTimeout: 10000,
    defaultHeaders: {
      'Accept': 'application/json',
    },
    endpoints: endpointConfigs,
  };
}
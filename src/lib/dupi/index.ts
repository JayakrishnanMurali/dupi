export { InterfaceParser } from './interface-parser';
export { MockGenerator } from './mock-generator';
export { ProjectManager } from './project-manager';
export * from './types';

import type { MockApiConfig } from './types';
import { ProjectManager } from './project-manager';

export function createDupiInstance(config?: Partial<MockApiConfig>): ProjectManager {
  const defaultConfig: MockApiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    defaultExpirationHours: 24,
    maxProjectsPerUser: 50,
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new ProjectManager(finalConfig);
}
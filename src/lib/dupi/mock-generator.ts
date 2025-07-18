import { faker } from '@faker-js/faker';
import type { TypeInfo, ParsedInterface } from './interface-parser';

export interface MockGeneratorOptions {
  arraySize?: number;
  locale?: string;
}

export class MockGenerator {
  private static readonly DEFAULT_ARRAY_SIZE = 3;

  static generateMockData(
    parsedInterface: ParsedInterface,
    options: MockGeneratorOptions = {}
  ): Record<string, unknown> {
    const { arraySize = this.DEFAULT_ARRAY_SIZE } = options;

    const result: Record<string, unknown> = {};

    for (const [propName, typeInfo] of Object.entries(parsedInterface.properties)) {
      if (typeInfo.isOptional && faker.datatype.boolean(0.3)) {
        continue;
      }

      const mockValue = this.generateValue(typeInfo, arraySize);
      result[propName] = mockValue;
    }

    return result;
  }

  private static generateValue(typeInfo: TypeInfo, arraySize: number): unknown {
    const baseValue = this.generateBaseValue(typeInfo);

    if (typeInfo.isArray) {
      const size = faker.number.int({ min: 1, max: arraySize });
      return Array.from({ length: size }, () => 
        typeInfo.type === 'object' && typeInfo.properties
          ? this.generateObjectValue(typeInfo.properties)
          : this.generateBaseValue(typeInfo)
      );
    }

    if (typeInfo.type === 'object' && typeInfo.properties) {
      return this.generateObjectValue(typeInfo.properties);
    }

    return baseValue;
  }

  private static generateObjectValue(properties: Record<string, TypeInfo>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [propName, propTypeInfo] of Object.entries(properties)) {
      if (propTypeInfo.isOptional && faker.datatype.boolean(0.3)) {
        continue;
      }

      result[propName] = this.generateValue(propTypeInfo, this.DEFAULT_ARRAY_SIZE);
    }

    return result;
  }

  private static generateBaseValue(typeInfo: TypeInfo): string | number | boolean {
    switch (typeInfo.type) {
      case 'string':
        return this.generateStringValue(typeInfo.format);
      
      case 'number':
        return faker.number.int({ min: 1, max: 1000 });
      
      case 'boolean':
        return faker.datatype.boolean();
      
      case 'date':
        return faker.date.recent().toISOString();
      
      default:
        return faker.lorem.word();
    }
  }

  private static generateStringValue(format?: string): string {
    switch (format) {
      case 'email':
        return faker.internet.email();
      
      case 'url':
        return faker.internet.url();
      
      case 'phone':
        return faker.phone.number();
      
      case 'name':
        return faker.person.fullName();
      
      case 'address':
        return faker.location.streetAddress();
      
      case 'company':
        return faker.company.name();
      
      case 'uuid':
        return faker.string.uuid();
      
      default:
        return faker.lorem.sentence({ min: 1, max: 5 });
    }
  }

  static generateMultipleRecords(
    parsedInterface: ParsedInterface,
    count: number,
    options: MockGeneratorOptions = {}
  ): Record<string, unknown>[] {
    return Array.from({ length: count }, () =>
      this.generateMockData(parsedInterface, options)
    );
  }
}
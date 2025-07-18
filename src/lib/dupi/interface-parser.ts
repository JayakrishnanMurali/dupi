export interface TypeInfo {
  type: string;
  isArray?: boolean;
  isOptional?: boolean;
  properties?: Record<string, TypeInfo>;
  format?: string;
}

export interface ParsedInterface {
  name: string;
  properties: Record<string, TypeInfo>;
}

export class InterfaceParser {
  private static readonly TYPE_PATTERNS = {
    string: /string/,
    number: /number/,
    boolean: /boolean/,
    date: /Date/,
    array: /\[\]$/,
    optional: /\?:/,
  };

  static parseInterface(interfaceString: string): ParsedInterface {
    const lines = interfaceString
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const interfaceNameMatch = lines[0]?.match(/interface\s+(\w+)/);
    const interfaceName = interfaceNameMatch?.[1] ?? 'UnknownInterface';

    const properties: Record<string, TypeInfo> = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line === '{' || line === '}') continue;
      
      const propertyMatch = /(\w+)(\?)?:\s*(.+?);?$/.exec(line);
      if (propertyMatch) {
        const [, propName, optional, typeStr] = propertyMatch;
        if (propName && typeStr) {
          properties[propName] = this.parseTypeInfo(typeStr, !!optional);
        }
      }
    }

    return {
      name: interfaceName,
      properties,
    };
  }

  private static parseTypeInfo(typeStr: string, isOptional = false): TypeInfo {
    const cleanType = typeStr.replace(/;$/, '').trim();
    const isArray = this.TYPE_PATTERNS.array.test(cleanType);
    const baseType = isArray ? cleanType.replace(/\[\]$/, '') : cleanType;

    if (this.TYPE_PATTERNS.string.test(baseType)) {
      return {
        type: 'string',
        isArray,
        isOptional,
        format: this.inferStringFormat(baseType),
      };
    }

    if (this.TYPE_PATTERNS.number.test(baseType)) {
      return { type: 'number', isArray, isOptional };
    }

    if (this.TYPE_PATTERNS.boolean.test(baseType)) {
      return { type: 'boolean', isArray, isOptional };
    }

    if (this.TYPE_PATTERNS.date.test(baseType)) {
      return { type: 'date', isArray, isOptional };
    }

    if (baseType.includes('{')) {
      const nestedProperties = this.parseNestedObject(baseType);
      return {
        type: 'object',
        isArray,
        isOptional,
        properties: nestedProperties,
      };
    }

    return { type: 'string', isArray, isOptional };
  }

  private static inferStringFormat(typeStr: string): string | undefined {
    const lowerType = typeStr.toLowerCase();
    
    if (lowerType.includes('email')) return 'email';
    if (lowerType.includes('url') || lowerType.includes('uri')) return 'url';
    if (lowerType.includes('phone')) return 'phone';
    if (lowerType.includes('name')) return 'name';
    if (lowerType.includes('address')) return 'address';
    if (lowerType.includes('company')) return 'company';
    if (lowerType.includes('uuid') || lowerType.includes('id')) return 'uuid';
    
    return undefined;
  }

  private static parseNestedObject(objectStr: string): Record<string, TypeInfo> {
    const properties: Record<string, TypeInfo> = {};
    const contentMatch = /\{(.*)\}/s.exec(objectStr);
    const content = contentMatch?.[1];
    
    if (!content) return properties;

    const props = content.split(',').map(prop => prop.trim());
    
    for (const prop of props) {
      const propMatch = /(\w+)(\?)?:\s*(.+)/.exec(prop);
      if (propMatch) {
        const [, propName, optional, typeStr] = propMatch;
        if (propName && typeStr) {
          properties[propName] = this.parseTypeInfo(typeStr, !!optional);
        }
      }
    }

    return properties;
  }
}
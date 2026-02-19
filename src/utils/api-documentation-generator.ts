/**
 * API Documentation Generator for BombayTaxiCo Express Backend
 * Automatically generates comprehensive API documentation from controllers and routes
 */

import * as fs from 'fs';
import * as path from 'path';
import { Request, Response, NextFunction } from 'express';

export interface ApiEndpoint {
  path: string;
  method: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: ResponseExample[];
  tags?: string[];
  security?: SecurityRequirement[];
  deprecated?: boolean;
  summary?: string;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required: boolean;
  type: string;
  example?: any;
  schema?: any;
}

export interface RequestBody {
  description?: string;
  required: boolean;
  contentType: string;
  schema?: any;
  example?: any;
}

export interface ResponseExample {
  statusCode: number;
  description: string;
  contentType?: string;
  schema?: any;
  example?: any;
}

export interface SecurityRequirement {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'header' | 'query' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  scopes?: string[];
}

export interface ApiDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  endpoints: ApiEndpoint[];
  securitySchemes?: Record<string, SecurityRequirement>;
  servers?: Server[];
  contact?: Contact;
  license?: License;
}

export interface Server {
  url: string;
  description: string;
}

export interface Contact {
  name: string;
  url?: string;
  email?: string;
}

export interface License {
  name: string;
  url?: string;
}

export class ApiDocumentationGenerator {
  private controllers: Map<string, any> = new Map();
  private routes: Map<string, any> = new Map();
  private schemas: Map<string, any> = new Map();

  constructor(
    private options: {
      title?: string;
      version?: string;
      description?: string;
      baseUrl?: string;
      outputDir?: string;
      includeExamples?: boolean;
      includeSchemas?: boolean;
    } = {}
  ) {
    this.options = {
      title: 'BombayTaxiCo API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for BombayTaxiCo Express Backend',
      baseUrl: 'http://localhost:3000/api',
      outputDir: './docs',
      includeExamples: true,
      includeSchemas: true,
      ...options
    };
  }

  /**
   * Scan controllers directory and extract API information
   */
  async scanControllers(controllersDir: string): Promise<void> {
    try {
      const controllerFiles = fs.readdirSync(controllersDir, { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.controller.ts'))
        .map(dirent => path.join(controllersDir, dirent.name));

      for (const filePath of controllerFiles) {
        await this.extractControllerInfo(filePath);
      }
    } catch (error) {
      console.error('Error scanning controllers:', error);
    }
  }

  /**
   * Extract information from a single controller file
   */
  private async extractControllerInfo(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const controllerName = path.basename(filePath, '.controller.ts');
      
      // Extract route handlers and their metadata
      const routes = this.extractRoutesFromContent(content, controllerName);
      
      for (const route of routes) {
        this.routes.set(`${route.method}_${route.path}`, route);
      }
    } catch (error) {
      console.error(`Error extracting info from ${filePath}:`, error);
    }
  }

  /**
   * Extract route information from controller content
   */
  private extractRoutesFromContent(content: string, controllerName: string): ApiEndpoint[] {
    const routes: ApiEndpoint[] = [];
    
    // Regex patterns to extract route information
    const routePatterns = {
      express: /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`](?:,\s*(async\s*)?\([^)]*\)\s*=>\s*{([^}]+)})?/g,
      comments: /\/\*\*\s*\n\s*\*\s*([^*]+)\*\//g,
      parameters: /\/\*\*\s*\n\s*\*\s*@param\s+{([^}]+)}\s+(\w+)\s+(.*)\n/g,
      returns: /\/\*\*\s*\n\s*\*\s*@returns\s+{([^}]+)}\s+(.*)\n/g
    };

    let match;
    while ((match = routePatterns.express.exec(content)) !== null) {
      const [, method, path, handlerBody] = match;
      
      const endpoint: ApiEndpoint = {
        path,
        method: method.toUpperCase(),
        description: this.extractDescription(content, method, path),
        parameters: this.extractParameters(content, method, path),
        requestBody: this.extractRequestBody(content, method, path),
        responses: this.extractResponses(content, method, path),
        tags: [controllerName.replace('.controller', '')],
        summary: this.extractSummary(content, method, path)
      };

      routes.push(endpoint);
    }

    return routes;
  }

  /**
   * Extract description from JSDoc comments
   */
  private extractDescription(content: string, method: string, path: string): string {
    const pattern = new RegExp(`router\\.${method}\\s*\\(\\s*['"\`]${path}['"\`]\\s*[,\\s]*\\/\\*\\*\\s*\\n\\s*\\*\\s*([^*]+)\\*\\/`, 'm');
    const match = content.match(pattern);
    return match ? match[1].trim() : `${method} ${path} endpoint`;
  }

  /**
   * Extract summary from JSDoc comments
   */
  private extractSummary(content: string, method: string, path: string): string {
    const description = this.extractDescription(content, method, path);
    return description.split('.')[0] || description;
  }

  /**
   * Extract parameters from JSDoc comments
   */
  private extractParameters(content: string, method: string, path: string): Parameter[] {
    const parameters: Parameter[] = [];
    const pattern = new RegExp(`router\\.${method}\\s*\\(\\s*['"\`]${path}['"\`]\\s*[,\\s]*([^)]+)\\s*=>`, 'm');
    const match = content.match(pattern);
    
    if (match) {
      const handlerSignature = match[1];
      const paramNames = this.extractParameterNames(handlerSignature);
      
      // Extract JSDoc parameter information
      const jsdocPattern = /\/\*\*\s*\n\s*\*\s*@param\s+{([^}]+)}\s+(\w+)\s+(.*)\n/g;
      let jsdocMatch;
      
      while ((jsdocMatch = jsdocPattern.exec(content)) !== null) {
        const [, type, name, description] = jsdocMatch;
        
        parameters.push({
          name,
          in: this.determineParameterLocation(name, method, path),
          description: description.trim(),
          required: !description.includes('optional'),
          type: this.normalizeType(type),
          example: this.generateExample(name, type)
        });
      }
    }

    return parameters;
  }

  /**
   * Extract request body information
   */
  private extractRequestBody(content: string, method: string, path: string): RequestBody | undefined {
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return undefined;
    }

    const description = `${method} ${path} request body`;
    const contentType = 'application/json';

    return {
      description,
      required: true,
      contentType,
      example: this.generateRequestBodyExample(method, path)
    };
  }

  /**
   * Extract response examples
   */
  private extractResponses(content: string, method: string, path: string): ResponseExample[] {
    const responses: ResponseExample[] = [];
    
    // Default success response
    responses.push({
      statusCode: 200,
      description: 'Successful response',
      contentType: 'application/json',
      example: this.generateSuccessExample(method, path)
    });

    // Default error responses
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      responses.push({
        statusCode: 400,
        description: 'Bad request - Invalid input data',
        contentType: 'application/json',
        example: {
          error: 'Bad request',
          message: 'Invalid input data',
          details: []
        }
      });
    }

    responses.push({
      statusCode: 401,
      description: 'Unauthorized - Authentication required',
      contentType: 'application/json',
      example: {
        error: 'Unauthorized',
        message: 'Authentication required'
      }
    });

    responses.push({
      statusCode: 500,
      description: 'Internal server error',
      contentType: 'application/json',
      example: {
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      }
    });

    return responses;
  }

  /**
   * Extract parameter names from function signature
   */
  private extractParameterNames(signature: string): string[] {
    const match = signature.match(/\(([^)]+)\)/);
    if (!match) return [];
    
    return match[1].split(',').map(param => {
      const parts = param.trim().split(':');
      return parts[0].trim();
    }).filter(name => name && name !== 'req' && name !== 'res' && name !== 'next');
  }

  /**
   * Determine parameter location based on name and context
   */
  private determineParameterLocation(name: string, method: string, path: string): 'path' | 'query' | 'header' | 'cookie' {
    if (path.includes(`:${name}`)) {
      return 'path';
    }
    if (['id', 'userId', 'bookingId', 'driverId'].includes(name)) {
      return 'path';
    }
    if (['page', 'limit', 'sort', 'order', 'search', 'filter'].includes(name)) {
      return 'query';
    }
    if (['authorization', 'x-api-key', 'content-type'].includes(name.toLowerCase())) {
      return 'header';
    }
    return 'query';
  }

  /**
   * Normalize type names
   */
  private normalizeType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'object',
      'array': 'array',
      'Request': 'object',
      'Response': 'object',
      'NextFunction': 'function'
    };
    
    return typeMap[type.toLowerCase()] || type;
  }

  /**
   * Generate example for parameter
   */
  private generateExample(name: string, type: string): any {
    const examples: Record<string, any> = {
      'id': 1,
      'userId': 1,
      'bookingId': 1,
      'driverId': 1,
      'page': 1,
      'limit': 10,
      'sort': 'createdAt',
      'order': 'desc',
      'search': 'example',
      'filter': '{}',
      'email': 'user@example.com',
      'name': 'John Doe',
      'phone': '+1234567890'
    };

    if (type === 'string') {
      return examples[name] || 'example';
    }
    if (type === 'number') {
      return examples[name] || 1;
    }
    if (type === 'boolean') {
      return true;
    }
    if (type === 'object') {
      return {};
    }
    if (type === 'array') {
      return [];
    }

    return examples[name] || null;
  }

  /**
   * Generate request body example
   */
  private generateRequestBodyExample(method: string, path: string): any {
    const examples: Record<string, any> = {
      'POST /auth/login': {
        email: 'user@example.com',
        password: 'password123'
      },
      'POST /auth/register': {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        phone: '+1234567890'
      },
      'POST /bookings': {
        routeId: 1,
        pickupLocation: {
          address: '123 Main St',
          coordinates: [19.0760, 72.8777]
        },
        dropoffLocation: {
          address: '456 Oak Ave',
          coordinates: [19.0860, 72.8877]
        },
        scheduledTime: '2024-01-01T10:00:00Z',
        taxiTypeId: 1
      },
      'PUT /users/:id': {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      }
    };

    const key = `${method} ${path}`;
    return examples[key] || { data: 'example' };
  }

  /**
   * Generate success response example
   */
  private generateSuccessExample(method: string, path: string): any {
    const examples: Record<string, any> = {
      'GET /auth/profile': {
        id: 1,
        name: 'John Doe',
        email: 'user@example.com',
        phone: '+1234567890',
        createdAt: '2024-01-01T00:00:00Z'
      },
      'POST /auth/login': {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'user@example.com'
        }
      },
      'GET /bookings': {
        bookings: [
          {
            id: 1,
            status: 'confirmed',
            totalAmount: 1500,
            createdAt: '2024-01-01T10:00:00Z'
          }
        ],
        total: 1,
        page: 1,
        limit: 10
      },
      'POST /bookings': {
        id: 1,
        status: 'pending',
        totalAmount: 1500,
        createdAt: '2024-01-01T10:00:00Z'
      }
    };

    const key = `${method} ${path}`;
    return examples[key] || { success: true, data: 'example' };
  }

  /**
   * Generate complete API documentation
   */
  async generateDocumentation(): Promise<ApiDocumentation> {
    const documentation: ApiDocumentation = {
      title: this.options.title!,
      version: this.options.version!,
      description: this.options.description!,
      baseUrl: this.options.baseUrl!,
      endpoints: Array.from(this.routes.values()),
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        }
      },
      servers: [
        {
          url: this.options.baseUrl!,
          description: 'Development server'
        },
        {
          url: 'https://api.bombaytaxico.com',
          description: 'Production server'
        }
      ],
      contact: {
        name: 'BombayTaxiCo API Team',
        email: 'api@bombaytaxico.com',
        url: 'https://bombaytaxico.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    };

    return documentation;
  }

  /**
   * Generate HTML documentation
   */
  async generateHtmlDocumentation(documentation: ApiDocumentation): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentation.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #e1e5e9;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .endpoint {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .endpoint-header {
            background: #f8f9fa;
            padding: 15px;
            border-bottom: 1px solid #e1e5e9;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
        }
        .method-get { background: #28a745; color: white; }
        .method-post { background: #007bff; color: white; }
        .method-put { background: #ffc107; color: black; }
        .method-delete { background: #dc3545; color: white; }
        .method-patch { background: #17a2b8; color: white; }
        .path {
            font-family: monospace;
            font-weight: bold;
            margin-left: 10px;
        }
        .endpoint-body {
            padding: 20px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section h3 {
            margin-bottom: 10px;
            color: #495057;
        }
        .parameter {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .parameter-name {
            font-weight: bold;
            color: #007bff;
        }
        .parameter-type {
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            margin-left: 8px;
        }
        .response {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .response-status {
            font-weight: bold;
            color: #28a745;
        }
        .example {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            font-family: monospace;
            font-size: 14px;
            overflow-x: auto;
        }
        .deprecated {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .tags {
            margin-top: 10px;
        }
        .tag {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${documentation.title}</h1>
        <p>Version: ${documentation.version}</p>
        <p>${documentation.description}</p>
        <p>Base URL: <code>${documentation.baseUrl}</code></p>
    </div>

    <div class="endpoints">
        ${documentation.endpoints.map(endpoint => this.generateEndpointHtml(endpoint)).join('')}
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toISOString()}</p>
        <p>Contact: ${documentation.contact?.name} &lt;${documentation.contact?.email}&gt;</p>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate HTML for a single endpoint
   */
  private generateEndpointHtml(endpoint: ApiEndpoint): string {
    return `
    <div class="endpoint">
        <div class="endpoint-header">
            <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
            <span class="path">${endpoint.path}</span>
            ${endpoint.deprecated ? '<span class="deprecated">⚠️ Deprecated</span>' : ''}
        </div>
        <div class="endpoint-body">
            ${endpoint.summary ? `<h2>${endpoint.summary}</h2>` : ''}
            ${endpoint.description ? `<p>${endpoint.description}</p>` : ''}
            
            ${endpoint.tags && endpoint.tags.length > 0 ? `
            <div class="tags">
                ${endpoint.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            ${endpoint.parameters && endpoint.parameters.length > 0 ? `
            <div class="section">
                <h3>Parameters</h3>
                ${endpoint.parameters.map(param => `
                <div class="parameter">
                    <span class="parameter-name">${param.name}</span>
                    <span class="parameter-type">${param.type}</span>
                    ${param.required ? '<span class="required">required</span>' : '<span class="optional">optional</span>'}
                    <br>
                    ${param.description ? `<small>${param.description}</small>` : ''}
                    ${param.example ? `<br><small>Example: ${JSON.stringify(param.example)}</small>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${endpoint.requestBody ? `
            <div class="section">
                <h3>Request Body</h3>
                <p>${endpoint.requestBody.description}</p>
                <p><strong>Content-Type:</strong> ${endpoint.requestBody.contentType}</p>
                ${endpoint.requestBody.example ? `
                <div class="example">
${JSON.stringify(endpoint.requestBody.example, null, 2)}
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${endpoint.responses && endpoint.responses.length > 0 ? `
            <div class="section">
                <h3>Responses</h3>
                ${endpoint.responses.map(response => `
                <div class="response">
                    <span class="response-status">${response.statusCode}</span>
                    <span>${response.description}</span>
                    ${response.example ? `
                    <div class="example">
${JSON.stringify(response.example, null, 2)}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>`;
  }

  /**
   * Generate OpenAPI/Swagger specification
   */
  async generateOpenApiSpec(documentation: ApiDocumentation): Promise<any> {
    const openApi: any = {
      openapi: '3.0.0',
      info: {
        title: documentation.title,
        version: documentation.version,
        description: documentation.description,
        contact: documentation.contact,
        license: documentation.license
      },
      servers: documentation.servers,
      paths: {},
      components: {
        securitySchemes: documentation.securitySchemes
      }
    };

    // Convert endpoints to OpenAPI paths
    for (const endpoint of documentation.endpoints) {
      if (!openApi.paths[endpoint.path]) {
        openApi.paths[endpoint.path] = {};
      }

      const operation: any = {
        summary: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
        description: endpoint.description,
        tags: endpoint.tags || [],
        parameters: endpoint.parameters?.map(param => ({
          name: param.name,
          in: param.in,
          description: param.description,
          required: param.required,
          schema: { type: param.type },
          example: param.example
        })) || [],
        responses: {}
      };

      // Add request body if present
      if (endpoint.requestBody) {
        operation.requestBody = {
          description: endpoint.requestBody.description,
          required: endpoint.requestBody.required,
          content: {
            [endpoint.requestBody.contentType]: {
              schema: endpoint.requestBody.schema || { type: 'object' },
              example: endpoint.requestBody.example
            }
          }
        };
      }

      // Add responses
      if (endpoint.responses) {
        for (const response of endpoint.responses) {
          operation.responses[response.statusCode.toString()] = {
            description: response.description,
            content: response.contentType ? {
              [response.contentType]: {
                schema: response.schema || { type: 'object' },
                example: response.example
              }
            } : {}
          };
        }
      }

      // Add security if required
      if (endpoint.security && endpoint.security.length > 0) {
        operation.security = endpoint.security.map(sec => {
          const key = Object.keys(documentation.securitySchemes || {}).find(
            k => documentation.securitySchemes![k].type === sec.type
          );
          return key ? { [key]: [] } : {};
        });
      }

      openApi.paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
    }

    return openApi;
  }

  /**
   * Save documentation to files
   */
  async saveDocumentation(documentation: ApiDocumentation): Promise<void> {
    const outputDir = this.options.outputDir!;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save HTML documentation
    const html = await this.generateHtmlDocumentation(documentation);
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);

    // Save OpenAPI specification
    const openApi = await this.generateOpenApiSpec(documentation);
    fs.writeFileSync(path.join(outputDir, 'openapi.json'), JSON.stringify(openApi, null, 2));

    // Save raw documentation data
    fs.writeFileSync(path.join(outputDir, 'documentation.json'), JSON.stringify(documentation, null, 2));

    console.log(`Documentation generated successfully in ${outputDir}`);
  }

  /**
   * Generate and save complete documentation
   */
  async generate(controllersDir: string): Promise<void> {
    console.log('Generating API documentation...');
    
    // Scan controllers
    await this.scanControllers(controllersDir);
    
    // Generate documentation
    const documentation = await this.generateDocumentation();
    
    // Save documentation
    await this.saveDocumentation(documentation);
    
    console.log('API documentation generation completed!');
  }
}

// Export utility function for easy usage
export async function generateApiDocumentation(options?: {
  controllersDir?: string;
  outputDir?: string;
  title?: string;
  version?: string;
  description?: string;
  baseUrl?: string;
}): Promise<void> {
  const generator = new ApiDocumentationGenerator(options);
  await generator.generate(options?.controllersDir || './src/controllers');
}

// Export types for external usage
export * from './api-documentation-generator';

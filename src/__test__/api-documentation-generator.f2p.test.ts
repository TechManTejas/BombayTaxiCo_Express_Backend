/**
 * F2P tests for API documentation generator.
 * These tests would fail on the base branch and pass after the fixes.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ApiDocumentationGenerator, generateApiDocumentation, ApiEndpoint } from '../utils/api-documentation-generator';

describe('API Documentation Generator F2P Tests', () => {
  let generator: ApiDocumentationGenerator;
  let tempDir: string;
  let controllersDir: string;

  beforeEach(() => {
    // Create temporary directories
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'api-doc-test-'));
    controllersDir = path.join(tempDir, 'controllers');
    fs.mkdirSync(controllersDir, { recursive: true });

    generator = new ApiDocumentationGenerator({
      title: 'Test API Documentation',
      version: '1.0.0',
      description: 'Test API documentation',
      baseUrl: 'http://localhost:3000/api',
      outputDir: path.join(tempDir, 'docs'),
      includeExamples: true,
      includeSchemas: true
    });
  });

  afterEach(() => {
    // Clean up temporary directories
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Controller Scanning', () => {
    it('should scan controllers directory and extract endpoints', async () => {
      // Bug: Should properly scan and extract endpoints from controller files
      const controllerContent = `
import { Request, Response } from 'express';

/**
 * Get all bookings
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise that resolves when response is sent
 */
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find();
    res.json({ bookings, total: bookings.length });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create a new booking
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise that resolves when response is sent
 */
router.post('/bookings', async (req: Request, res: Response) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
});

/**
 * Get booking by ID
 * @param {Request} req - Express request object with booking ID parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Promise that resolves when response is sent
 */
router.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
`;

      const controllerPath = path.join(controllersDir, 'booking.controller.ts');
      fs.writeFileSync(controllerPath, controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      expect(documentation.endpoints).toHaveLength(3);
      
      const getEndpoint = documentation.endpoints.find(e => e.method === 'GET' && e.path === '/bookings');
      expect(getEndpoint).toBeDefined();
      expect(getEndpoint?.summary).toBe('Get all bookings');
      expect(getEndpoint?.description).toContain('Get all bookings');
      expect(getEndpoint?.tags).toContain('booking');

      const postEndpoint = documentation.endpoints.find(e => e.method === 'POST' && e.path === '/bookings');
      expect(postEndpoint).toBeDefined();
      expect(postEndpoint?.summary).toBe('Create a new booking');
      expect(postEndpoint?.requestBody).toBeDefined();
      expect(postEndpoint?.requestBody?.required).toBe(true);

      const getByIdEndpoint = documentation.endpoints.find(e => e.method === 'GET' && e.path === '/bookings/:id');
      expect(getByIdEndpoint).toBeDefined();
      expect(getByIdEndpoint?.parameters).toBeDefined();
      expect(getByIdEndpoint?.parameters?.some(p => p.name === 'id' && p.in === 'path')).toBe(true);
    });

    it('should handle multiple controller files', async () => {
      // Bug: Should process multiple controller files correctly
      const bookingController = `
router.get('/bookings', async (req: Request, res: Response) => {
  res.json({ bookings: [] });
});
`;

      const userController = `
router.get('/users', async (req: Request, res: Response) => {
  res.json({ users: [] });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'booking.controller.ts'), bookingController);
      fs.writeFileSync(path.join(controllersDir, 'user.controller.ts'), userController);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      expect(documentation.endpoints).toHaveLength(2);
      expect(documentation.endpoints.some(e => e.path === '/bookings')).toBe(true);
      expect(documentation.endpoints.some(e => e.path === '/users')).toBe(true);
    });

    it('should handle empty controllers directory', async () => {
      // Bug: Should handle empty directory gracefully
      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      expect(documentation.endpoints).toHaveLength(0);
    });

    it('should handle non-existent controllers directory', async () => {
      // Bug: Should handle non-existent directory gracefully
      const nonExistentDir = path.join(tempDir, 'non-existent');
      
      await expect(generator.scanControllers(nonExistentDir)).resolves.not.toThrow();
    });
  });

  describe('Route Extraction', () => {
    it('should extract all HTTP methods', async () => {
      // Bug: Should extract all HTTP methods (GET, POST, PUT, DELETE, PATCH)
      const controllerContent = `
router.get('/test', (req, res) => res.json({}));
router.post('/test', (req, res) => res.json({}));
router.put('/test', (req, res) => res.json({}));
router.delete('/test', (req, res) => res.json({}));
router.patch('/test', (req, res) => res.json({}));
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const methods = documentation.endpoints.map(e => e.method);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
      expect(methods).toContain('PATCH');
    });

    it('should extract route parameters', async () => {
      // Bug: Should extract route parameters correctly
      const controllerContent = `
router.get('/users/:userId/bookings/:bookingId', (req, res) => {
  const { userId, bookingId } = req.params;
  res.json({ userId, bookingId });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.path === '/users/:userId/bookings/:bookingId');
      expect(endpoint).toBeDefined();
      expect(endpoint?.parameters).toBeDefined();
      
      const userIdParam = endpoint?.parameters?.find(p => p.name === 'userId');
      expect(userIdParam).toBeDefined();
      expect(userIdParam?.in).toBe('path');
      expect(userIdParam?.required).toBe(true);

      const bookingIdParam = endpoint?.parameters?.find(p => p.name === 'bookingId');
      expect(bookingIdParam).toBeDefined();
      expect(bookingIdParam?.in).toBe('path');
      expect(bookingIdParam?.required).toBe(true);
    });

    it('should extract complex route patterns', async () => {
      // Bug: Should handle complex route patterns
      const controllerContent = `
router.get('/api/v1/users/:userId/profile', (req, res) => res.json({}));
router.post('/api/v1/admin/users/:userId/permissions', (req, res) => res.json({}));
router.get('/search/:category/:subcategory?', (req, res) => res.json({}));
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      expect(documentation.endpoints).toHaveLength(3);
      
      const complexPath = documentation.endpoints.find(e => e.path === '/api/v1/users/:userId/profile');
      expect(complexPath).toBeDefined();
      expect(complexPath?.parameters?.some(p => p.name === 'userId')).toBe(true);
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract query parameters', async () => {
      // Bug: Should extract query parameters from JSDoc
      const controllerContent = `
/**
 * Search bookings with filters
 * @param {Request} req - Express request object
 * @param {string} req.query.search - Search term
 * @param {number} req.query.page - Page number (optional)
 * @param {string} req.query.sort - Sort field
 * @param {string} req.query.order - Sort order (asc/desc)
 * @param {Response} res - Express response object
 */
router.get('/bookings/search', (req: Request, res: Response) => {
  const { search, page, sort, order } = req.query;
  res.json({ search, page, sort, order });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.path === '/bookings/search');
      expect(endpoint).toBeDefined();
      expect(endpoint?.parameters).toBeDefined();

      const searchParam = endpoint?.parameters?.find(p => p.name === 'search');
      expect(searchParam).toBeDefined();
      expect(searchParam?.in).toBe('query');
      expect(searchParam?.type).toBe('string');

      const pageParam = endpoint?.parameters?.find(p => p.name === 'page');
      expect(pageParam).toBeDefined();
      expect(pageParam?.in).toBe('query');
      expect(pageParam?.type).toBe('number');
    });

    it('should determine parameter locations correctly', async () => {
      // Bug: Should correctly determine parameter locations
      const controllerContent = `
router.get('/users/:id', (req, res) => {
  const { id, page, limit } = { ...req.params, ...req.query };
  res.json({ id, page, limit });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.path === '/users/:id');
      expect(endpoint).toBeDefined();
      expect(endpoint?.parameters).toBeDefined();

      const idParam = endpoint?.parameters?.find(p => p.name === 'id');
      expect(idParam?.in).toBe('path');

      const pageParam = endpoint?.parameters?.find(p => p.name === 'page');
      expect(pageParam?.in).toBe('query');
    });

    it('should generate parameter examples', async () => {
      // Bug: Should generate appropriate examples for parameters
      const controllerContent = `
router.get('/test', (req, res) => {
  const { id, email, page, search } = req.query;
  res.json({ id, email, page, search });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.path === '/test');
      expect(endpoint).toBeDefined();
      expect(endpoint?.parameters).toBeDefined();

      const idParam = endpoint?.parameters?.find(p => p.name === 'id');
      expect(idParam?.example).toBe(1);

      const emailParam = endpoint?.parameters?.find(p => p.name === 'email');
      expect(emailParam?.example).toBe('user@example.com');

      const pageParam = endpoint?.parameters?.find(p => p.name === 'page');
      expect(pageParam?.example).toBe(1);
    });
  });

  describe('Request Body Extraction', () => {
    it('should extract request body for POST endpoints', async () => {
      // Bug: Should extract request body for POST endpoints
      const controllerContent = `
/**
 * Create a new user
 * @param {Request} req - Express request object
 * @param {string} req.body.name - User name
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @param {Response} res - Express response object
 */
router.post('/users', (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  res.status(201).json({ name, email });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'POST' && e.path === '/users');
      expect(endpoint).toBeDefined();
      expect(endpoint?.requestBody).toBeDefined();
      expect(endpoint?.requestBody?.required).toBe(true);
      expect(endpoint?.requestBody?.contentType).toBe('application/json');
      expect(endpoint?.requestBody?.description).toContain('request body');
    });

    it('should extract request body for PUT endpoints', async () => {
      // Bug: Should extract request body for PUT endpoints
      const controllerContent = `
router.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  res.json({ id, ...updates });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'PUT' && e.path === '/users/:id');
      expect(endpoint).toBeDefined();
      expect(endpoint?.requestBody).toBeDefined();
      expect(endpoint?.requestBody?.required).toBe(true);
    });

    it('should not extract request body for GET endpoints', async () => {
      // Bug: Should not extract request body for GET endpoints
      const controllerContent = `
router.get('/users', (req: Request, res: Response) => {
  res.json({ users: [] });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'GET' && e.path === '/users');
      expect(endpoint).toBeDefined();
      expect(endpoint?.requestBody).toBeUndefined();
    });

    it('should generate request body examples', async () => {
      // Bug: Should generate appropriate request body examples
      const controllerContent = `
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json({ token: 'abc123' });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'POST' && e.path === '/auth/login');
      expect(endpoint).toBeDefined();
      expect(endpoint?.requestBody?.example).toBeDefined();
      expect(endpoint?.requestBody?.example).toHaveProperty('email');
      expect(endpoint?.requestBody?.example).toHaveProperty('password');
    });
  });

  describe('Response Extraction', () => {
    it('should extract success responses', async () => {
      // Bug: Should extract success response examples
      const controllerContent = `
router.get('/users', (req: Request, res: Response) => {
  res.json({ users: [{ id: 1, name: 'John' }] });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'GET' && e.path === '/users');
      expect(endpoint).toBeDefined();
      expect(endpoint?.responses).toBeDefined();

      const successResponse = endpoint?.responses?.find(r => r.statusCode === 200);
      expect(successResponse).toBeDefined();
      expect(successResponse?.description).toContain('Successful');
      expect(successResponse?.example).toBeDefined();
    });

    it('should extract error responses', async () => {
      // Bug: Should extract error response examples
      const controllerContent = `
router.post('/users', (req: Request, res: Response) => {
  res.status(400).json({ error: 'Bad request' });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'POST' && e.path === '/users');
      expect(endpoint).toBeDefined();
      expect(endpoint?.responses).toBeDefined();

      const badRequestResponse = endpoint?.responses?.find(r => r.statusCode === 400);
      expect(badRequestResponse).toBeDefined();
      expect(badRequestResponse?.description).toContain('Bad request');

      const unauthorizedResponse = endpoint?.responses?.find(r => r.statusCode === 401);
      expect(unauthorizedResponse).toBeDefined();
      expect(unauthorizedResponse?.description).toContain('Unauthorized');
    });

    it('should generate appropriate response examples', async () => {
      // Bug: Should generate appropriate response examples based on endpoint
      const controllerContent = `
router.post('/auth/login', (req: Request, res: Response) => {
  res.json({ token: 'abc123', user: { id: 1, name: 'John' } });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.method === 'POST' && e.path === '/auth/login');
      expect(endpoint).toBeDefined();
      expect(endpoint?.responses).toBeDefined();

      const successResponse = endpoint?.responses?.find(r => r.statusCode === 200);
      expect(successResponse?.example).toBeDefined();
      expect(successResponse?.example).toHaveProperty('token');
      expect(successResponse?.example).toHaveProperty('user');
    });
  });

  describe('HTML Documentation Generation', () => {
    it('should generate HTML documentation', async () => {
      // Bug: Should generate complete HTML documentation
      const controllerContent = `
/**
 * Get all users
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
router.get('/users', (req: Request, res: Response) => {
  res.json({ users: [] });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const html = await generator.generateHtmlDocumentation(documentation);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain(documentation.title);
      expect(html).toContain(documentation.description);
      expect(html).toContain('/users');
      expect(html).toContain('method-get');
      expect(html).toContain('GET');
      expect(html).toContain('Get all users');
    });

    it('should include endpoint details in HTML', async () => {
      // Bug: Should include detailed endpoint information in HTML
      const controllerContent = `
/**
 * Create user
 * @param {string} req.body.name - User name
 * @param {string} req.body.email - User email
 */
router.post('/users', (req: Request, res: Response) => {
  res.json({ id: 1, name: req.body.name });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const html = await generator.generateHtmlDocumentation(documentation);

      expect(html).toContain('method-post');
      expect(html).toContain('Request Body');
      expect(html).toContain('Parameters');
      expect(html).toContain('Responses');
    });

    it('should include styling in HTML', async () => {
      // Bug: Should include proper CSS styling in HTML
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const html = await generator.generateHtmlDocumentation(documentation);

      expect(html).toContain('<style>');
      expect(html).toContain('.method-get');
      expect(html).toContain('.endpoint');
      expect(html).toContain('.parameter');
      expect(html).toContain('.response');
    });
  });

  describe('OpenAPI Specification Generation', () => {
    it('should generate OpenAPI specification', async () => {
      // Bug: Should generate valid OpenAPI specification
      const controllerContent = `
/**
 * Get all users
 */
router.get('/users', (req: Request, res: Response) => {
  res.json({ users: [] });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const openApi = await generator.generateOpenApiSpec(documentation);

      expect(openApi.openapi).toBe('3.0.0');
      expect(openApi.info.title).toBe(documentation.title);
      expect(openApi.info.version).toBe(documentation.version);
      expect(openApi.paths).toHaveProperty('/users');
      expect(openApi.paths['/users']).toHaveProperty('get');
      expect(openApi.components).toHaveProperty('securitySchemes');
    });

    it('should include endpoints in OpenAPI paths', async () => {
      // Bug: Should correctly include endpoints in OpenAPI paths
      const controllerContent = `
router.get('/users', (req: Request, res: Response) => {
  res.json({ users: [] });
});
router.post('/users', (req: Request, res: Response) => {
  res.json({ id: 1 });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const openApi = await generator.generateOpenApiSpec(documentation);

      expect(openApi.paths['/users']).toHaveProperty('get');
      expect(openApi.paths['/users']).toHaveProperty('post');
      
      const getOperation = openApi.paths['/users'].get;
      expect(getOperation.summary).toBeDefined();
      expect(getOperation.responses).toBeDefined();
      expect(getOperation.responses).toHaveProperty('200');
    });

    it('should include parameters in OpenAPI operations', async () => {
      // Bug: Should include parameters in OpenAPI operations
      const controllerContent = `
router.get('/users/:id', (req: Request, res: Response) => {
  res.json({ id: req.params.id });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const openApi = await generator.generateOpenApiSpec(documentation);

      const getOperation = openApi.paths['/users/:id'].get;
      expect(getOperation.parameters).toBeDefined();
      expect(getOperation.parameters?.length).toBeGreaterThan(0);
      
      const idParam = getOperation.parameters?.find((p: any) => p.name === 'id');
      expect(idParam).toBeDefined();
      expect(idParam?.in).toBe('path');
      expect(idParam?.required).toBe(true);
    });

    it('should include request body in OpenAPI operations', async () => {
      // Bug: Should include request body in OpenAPI operations
      const controllerContent = `
router.post('/users', (req: Request, res: Response) => {
  res.json({ id: 1 });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const openApi = await generator.generateOpenApiSpec(documentation);

      const postOperation = openApi.paths['/users'].post;
      expect(postOperation.requestBody).toBeDefined();
      expect(postOperation.requestBody?.required).toBe(true);
      expect(postOperation.requestBody?.content).toHaveProperty('application/json');
    });
  });

  describe('File Output', () => {
    it('should save HTML documentation file', async () => {
      // Bug: Should save HTML documentation to file
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      await generator.saveDocumentation(documentation);

      const htmlPath = path.join(tempDir, 'docs', 'index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);
      
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('/test');
    });

    it('should save OpenAPI specification file', async () => {
      // Bug: Should save OpenAPI specification to file
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      await generator.saveDocumentation(documentation);

      const openApiPath = path.join(tempDir, 'docs', 'openapi.json');
      expect(fs.existsSync(openApiPath)).toBe(true);
      
      const openApiContent = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
      expect(openApiContent.openapi).toBe('3.0.0');
      expect(openApiContent.paths).toHaveProperty('/test');
    });

    it('should save raw documentation file', async () => {
      // Bug: Should save raw documentation data to file
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      await generator.saveDocumentation(documentation);

      const docPath = path.join(tempDir, 'docs', 'documentation.json');
      expect(fs.existsSync(docPath)).toBe(true);
      
      const docContent = JSON.parse(fs.readFileSync(docPath, 'utf-8'));
      expect(docContent.title).toBe(documentation.title);
      expect(docContent.endpoints).toHaveLength(1);
    });

    it('should create output directory if it does not exist', async () => {
      // Bug: Should create output directory if it doesn't exist
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      const outputDir = path.join(tempDir, 'new-docs');
      expect(fs.existsSync(outputDir)).toBe(false);

      generator = new ApiDocumentationGenerator({
        outputDir
      });

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      await generator.saveDocumentation(documentation);

      expect(fs.existsSync(outputDir)).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'index.html'))).toBe(true);
    });
  });

  describe('Utility Function', () => {
    it('should provide utility function for easy usage', async () => {
      // Bug: Should provide utility function for easy documentation generation
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      const outputDir = path.join(tempDir, 'util-docs');
      
      await generateApiDocumentation({
        controllersDir,
        outputDir,
        title: 'Utility Test API',
        version: '2.0.0'
      });

      expect(fs.existsSync(outputDir)).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(outputDir, 'openapi.json'))).toBe(true);
    });

    it('should use default options when none provided', async () => {
      // Bug: Should use default options when none provided
      const controllerContent = `
router.get('/test', (req: Request, res: Response) => {
  res.json({});
});
`;

      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      // This should not throw and should use defaults
      await expect(generateApiDocumentation()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed controller files', async () => {
      // Bug: Should handle malformed controller files gracefully
      const malformedContent = `
This is not valid TypeScript code
router.get('/test', (req, res) => {
  res.json({})
      // Missing closing brace
`;

      fs.writeFileSync(path.join(controllersDir, 'malformed.controller.ts'), malformedContent);

      await expect(generator.scanControllers(controllersDir)).resolves.not.toThrow();
      
      const documentation = await generator.generateDocumentation();
      expect(documentation.endpoints).toHaveLength(0);
    });

    it('should handle file system errors gracefully', async () => {
      // Bug: Should handle file system errors gracefully
      // Mock fs.readFileSync to throw an error
      const originalReadFileSync = (fs as any).readFileSync;
      (fs as any).readFileSync = jest.fn().mockImplementation(() => {
        throw new Error('File system error');
      });

      const controllerContent = `router.get('/test', (req, res) => res.json({}));`;
      fs.writeFileSync(path.join(controllersDir, 'test.controller.ts'), controllerContent);

      await expect(generator.scanControllers(controllersDir)).resolves.not.toThrow();

      // Restore original function
      (fs as any).readFileSync = originalReadFileSync;
    });

    it('should handle empty route definitions', async () => {
      // Bug: Should handle empty route definitions
      const emptyContent = `
// This file has no routes
const test = 'test';
export default test;
`;

      fs.writeFileSync(path.join(controllersDir, 'empty.controller.ts'), emptyContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      expect(documentation.endpoints).toHaveLength(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle nested route structures', async () => {
      // Bug: Should handle complex nested route structures
      const controllerContent = `
router.get('/api/v1/users', (req, res) => res.json({}));
router.post('/api/v1/users/:userId/bookings', (req, res) => res.json({}));
router.put('/api/v1/users/:userId/bookings/:bookingId', (req, res) => res.json({}));
router.delete('/api/v1/admin/users/:userId', (req, res) => res.json({}));
`;

      fs.writeFileSync(path.join(controllersDir, 'complex.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      expect(documentation.endpoints).toHaveLength(4);
      
      const nestedEndpoint = documentation.endpoints.find(e => 
        e.path === '/api/v1/users/:userId/bookings/:bookingId'
      );
      expect(nestedEndpoint).toBeDefined();
      expect(nestedEndpoint?.parameters?.length).toBeGreaterThan(1);
    });

    it('should handle multiple parameter types', async () => {
      // Bug: Should handle various parameter types correctly
      const controllerContent = `
/**
 * Complex endpoint with multiple parameter types
 * @param {string} req.query.search - Search query
 * @param {number} req.query.page - Page number
 * @param {boolean} req.query.active - Active status
 * @param {object} req.query.filters - Filter object
 * @param {array} req.query.tags - Tag array
 */
router.get('/complex/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { search, page, active, filters, tags } = req.query;
  res.json({ id, search, page, active, filters, tags });
});
`;

      fs.writeFileSync(path.join(controllersDir, 'complex.controller.ts'), controllerContent);

      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();

      const endpoint = documentation.endpoints.find(e => e.path === '/complex/:id');
      expect(endpoint).toBeDefined();
      expect(endpoint?.parameters).toBeDefined();

      const types = endpoint?.parameters?.map((p: any) => p.type);
      expect(types).toContain('string');
      expect(types).toContain('number');
      expect(types).toContain('boolean');
      expect(types).toContain('object');
      expect(types).toContain('array');
    });

    it('should handle large controller files', async () => {
      // Bug: Should handle large controller files efficiently
      let largeContent = '';
      
      // Generate a large controller file with many routes
      for (let i = 0; i < 100; i++) {
        largeContent += `
/**
 * Route ${i}
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
router.get('/route${i}', (req: Request, res: Response) => {
  res.json({ route: ${i} });
});
`;
      }

      fs.writeFileSync(path.join(controllersDir, 'large.controller.ts'), largeContent);

      const startTime = Date.now();
      await generator.scanControllers(controllersDir);
      const documentation = await generator.generateDocumentation();
      const endTime = Date.now();

      expect(documentation.endpoints).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});

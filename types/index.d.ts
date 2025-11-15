import { Application, RequestHandler, ErrorRequestHandler } from 'express';
import { Server } from 'http';

export interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    [key: string]: any;
  };
  paths: {
    [path: string]: any;
  };
  [key: string]: any;
}

export interface SwaglexConfig {
  /**
   * Port number for the server
   * @default 3001
   */
  port?: number;
  
  /**
   * Path to the OpenAPI specification file (YAML or JSON)
   * @required
   */
  specPath: string;
  
  /**
   * Enable or configure CORS
   * @default true
   */
  cors?: boolean | object;
  
  /**
   * Enable health check endpoint
   * @default true
   */
  healthCheck?: boolean;
  
  /**
   * Enable validation endpoint
   * @default true
   */
  validation?: boolean;
  
  /**
   * Redirect root path to Swagger UI
   * @default true
   */
  redirectRoot?: boolean;
  
  /**
   * Path for Swagger UI
   * @default '/api-docs'
   */
  uiPath?: string;
  
  /**
   * Path for JSON specification endpoint
   * @default '/api-docs.json'
   */
  jsonPath?: string;
  
  /**
   * Path for YAML specification endpoint
   * @default '/api-docs.yaml'
   */
  yamlPath?: string;
  
  /**
   * Path for health check endpoint
   * @default '/health'
   */
  healthPath?: string;
  
  /**
   * Path for validation endpoint
   * @default '/validate'
   */
  validatePath?: string;
  
  /**
   * Custom CSS for Swagger UI
   */
  customCss?: string;
  
  /**
   * Swagger UI options
   */
  swaggerUiOptions?: {
    explorer?: boolean;
    tryItOutEnabled?: boolean;
    swaggerOptions?: any;
    [key: string]: any;
  };
  
  /**
   * API name to display
   */
  apiName?: string;
  
  /**
   * Custom site title
   */
  siteTitle?: string;
  
  /**
   * Extra data to include in health check response
   */
  healthExtra?: object;
  
  /**
   * Fallback info if spec loading fails
   */
  fallbackInfo?: {
    title?: string;
    version?: string;
    description?: string;
  };
  
  /**
   * Function to register custom routes
   * @param app Express application
   * @param spec Loaded OpenAPI specification
   */
  routes?: (app: Application, spec: SwaggerSpec) => void;
}

export interface SwaglexServer {
  /**
   * Express application instance
   */
  app: Application;
  
  /**
   * Loaded OpenAPI specification
   */
  spec: SwaggerSpec;
  
  /**
   * Server configuration
   */
  config: SwaglexConfig;
  
  /**
   * Start the server
   * @param port Port number (optional, uses config.port if not specified)
   * @param callback Callback function called after server starts
   * @returns HTTP Server instance
   */
  start: (port?: number, callback?: (server: Server) => void) => Server;
}

export interface HealthCheckOptions {
  version?: string;
  extra?: object;
}

/**
 * Create a Swagger documentation server
 * @param config Server configuration
 * @returns Server instance
 */
export function createSwaggerServer(config: SwaglexConfig): SwaglexServer;

/**
 * Load and parse OpenAPI specification with $ref resolution
 * @param specPath Path to the main OpenAPI specification file
 * @returns Resolved OpenAPI specification
 */
export function loadSwaggerSpec(specPath: string): SwaggerSpec;

/**
 * Create a fallback OpenAPI spec in case of loading errors
 * @param info Basic info for the fallback spec
 * @returns Minimal OpenAPI specification
 */
export function createFallbackSpec(info?: {
  title?: string;
  version?: string;
  description?: string;
}): SwaggerSpec;

/**
 * Create middleware to serve OpenAPI spec as JSON
 * @param swaggerSpec The OpenAPI specification object
 * @returns Express middleware
 */
export function createJsonEndpoint(swaggerSpec: SwaggerSpec): RequestHandler;

/**
 * Create middleware to serve OpenAPI spec as YAML
 * @param swaggerSpec The OpenAPI specification object
 * @returns Express middleware
 */
export function createYamlEndpoint(swaggerSpec: SwaggerSpec): RequestHandler;

/**
 * Create health check endpoint
 * @param options Health check options
 * @returns Express middleware
 */
export function createHealthCheck(options?: HealthCheckOptions): RequestHandler;

/**
 * Create validation endpoint
 * @param swaggerSpec The OpenAPI specification object
 * @returns Express middleware
 */
export function createValidationEndpoint(swaggerSpec: SwaggerSpec): RequestHandler;

/**
 * Create error handling middleware
 * @returns Express error middleware
 */
export function createErrorHandler(): ErrorRequestHandler;

/**
 * Create 404 handler
 * @param availableEndpoints List of available endpoints
 * @returns Express middleware
 */
export function create404Handler(availableEndpoints?: string[]): RequestHandler;

export const DEFAULT_CONFIG: Partial<SwaglexConfig>;

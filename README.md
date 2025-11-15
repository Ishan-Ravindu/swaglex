# Swaglex 🚀

**Swaglex** is a flexible and elegant OpenAPI/Swagger documentation server framework built on Express.js. It provides a simple way to serve interactive API documentation with automatic $ref resolution, customizable UI, and extensible endpoints.

## Features

✨ **Simple Setup** - Get your API docs running with just a few lines of code  
📖 **Interactive UI** - Beautiful Swagger UI with full customization support  
🔗 **Auto $ref Resolution** - Automatically resolves local file references in your OpenAPI specs  
🎨 **Customizable** - Extensive configuration options for styling and behavior  
🔌 **Extensible** - Add custom routes and middleware easily  
📦 **Modular** - Use individual components or the complete server  
🔒 **TypeScript Support** - Full TypeScript type definitions included  
🌐 **CORS Ready** - Built-in CORS support with configurable options

## Installation

```bash
npm install swaglex
```

## Quick Start

```javascript
const { createSwaggerServer } = require('swaglex');
const path = require('path');

const server = createSwaggerServer({
  specPath: path.join(__dirname, 'api', 'openapi.yaml'),
  port: 3001
});

server.start();
```

That's it! Your API documentation is now available at `http://localhost:3001/api-docs`

## Configuration

Swaglex offers extensive configuration options:

```javascript
const server = createSwaggerServer({
  // Required: Path to your OpenAPI specification file
  specPath: './api/openapi.yaml',
  
  // Optional: Server settings
  port: 3001,                    // Default: 3001
  
  // Optional: Enable/disable features
  cors: true,                    // Enable CORS (default: true)
  healthCheck: true,             // Enable /health endpoint (default: true)
  validation: true,              // Enable /validate endpoint (default: true)
  redirectRoot: true,            // Redirect / to /api-docs (default: true)
  
  // Optional: Customize paths
  uiPath: '/api-docs',          // Swagger UI path (default: '/api-docs')
  jsonPath: '/api-docs.json',   // JSON spec path (default: '/api-docs.json')
  yamlPath: '/api-docs.yaml',   // YAML spec path (default: '/api-docs.yaml')
  healthPath: '/health',        // Health check path (default: '/health')
  validatePath: '/validate',    // Validation path (default: '/validate')
  
  // Optional: Customize UI
  apiName: 'My API',
  siteTitle: 'My API Documentation',
  customCss: `
    .swagger-ui .topbar { background-color: #2c3e50; }
    .swagger-ui .info .title { color: #3498db; }
  `,
  
  // Optional: Swagger UI options
  swaggerUiOptions: {
    explorer: true,
    tryItOutEnabled: true,
    swaggerOptions: {
      persistAuthorization: true
    }
  },
  
  // Optional: Health check extra data
  healthExtra: {
    service: 'api-docs',
    environment: process.env.NODE_ENV
  },
  
  // Optional: Fallback info if spec loading fails
  fallbackInfo: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Unable to load specification'
  },
  
  // Optional: Add custom routes
  routes: (app, spec) => {
    app.get('/custom', (req, res) => {
      res.json({ message: 'Custom endpoint', apiVersion: spec.info.version });
    });
  }
});

// Start the server
server.start();

// Or specify port and callback
server.start(8080, (httpServer) => {
  console.log('Server started successfully!');
});
```

## API Reference

### createSwaggerServer(config)

Creates a new Swaglex server instance.

**Parameters:**
- `config` (Object): Configuration object (see Configuration section)

**Returns:**
- `SwaglexServer` object with properties:
  - `app`: Express application instance
  - `spec`: Loaded OpenAPI specification
  - `config`: Resolved configuration
  - `start(port?, callback?)`: Method to start the server

### Built-in Endpoints

When you create a Swaglex server, the following endpoints are automatically available:

- `GET /api-docs` - Interactive Swagger UI
- `GET /api-docs.json` - OpenAPI specification in JSON format
- `GET /api-docs.yaml` - OpenAPI specification in YAML format
- `GET /health` - Health check endpoint (if enabled)
- `POST /validate` - Validate API specification (if enabled)

## Advanced Usage

### Using Individual Components

You can use Swaglex components individually for more control:

```javascript
const express = require('express');
const {
  loadSwaggerSpec,
  createJsonEndpoint,
  createHealthCheck
} = require('swaglex');

const app = express();
const spec = loadSwaggerSpec('./api/openapi.yaml');

app.get('/spec', createJsonEndpoint(spec));
app.get('/health', createHealthCheck({ version: '1.0.0' }));

app.listen(3000);
```

### Custom Middleware

Add custom middleware before or after Swaglex setup:

```javascript
const { createSwaggerServer } = require('swaglex');

const server = createSwaggerServer({
  specPath: './api/openapi.yaml'
});

// Add custom middleware to the Express app
server.app.use('/custom', (req, res) => {
  res.json({ custom: 'response' });
});

server.start();
```

### Multiple Specifications

Serve multiple API specifications:

```javascript
const express = require('express');
const { loadSwaggerSpec } = require('swaglex');
const swaggerUi = require('swagger-ui-express');

const app = express();

const specV1 = loadSwaggerSpec('./api/v1/openapi.yaml');
const specV2 = loadSwaggerSpec('./api/v2/openapi.yaml');

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specV1));
app.use('/api/v2/docs', swaggerUi.serve, swaggerUi.setup(specV2));

app.listen(3000);
```

## Examples

### Basic Example

```javascript
const { createSwaggerServer } = require('swaglex');

createSwaggerServer({
  specPath: './openapi.yaml'
}).start();
```

### Custom Styling

```javascript
const { createSwaggerServer } = require('swaglex');

createSwaggerServer({
  specPath: './openapi.yaml',
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { 
      font-size: 3em; 
      color: #2c3e50; 
    }
    .swagger-ui .scheme-container {
      background: #f8f9fa;
      padding: 20px;
    }
  `,
  siteTitle: 'My Beautiful API Docs'
}).start();
```

### With Authentication

```javascript
const { createSwaggerServer } = require('swaglex');

const server = createSwaggerServer({
  specPath: './openapi.yaml',
  swaggerUiOptions: {
    swaggerOptions: {
      persistAuthorization: true,
      requestInterceptor: (req) => {
        req.headers['X-API-Key'] = process.env.API_KEY;
        return req;
      }
    }
  }
});

server.start();
```

### Production Setup

```javascript
const { createSwaggerServer } = require('swaglex');

const server = createSwaggerServer({
  specPath: './api/openapi.yaml',
  port: process.env.PORT || 3001,
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  },
  healthExtra: {
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION
  },
  routes: (app, spec) => {
    // Add custom authentication
    app.use('/api-docs', (req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth || !validateAuth(auth)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    });
  }
});

server.start(undefined, (httpServer) => {
  console.log('Production server started');
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
```

## OpenAPI Specification

Swaglex automatically resolves `$ref` references in your OpenAPI specification. You can split your spec into multiple files:

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    $ref: './paths/users.yaml'
components:
  schemas:
    $ref: './components/schemas.yaml'
```

## TypeScript Support

Swaglex includes full TypeScript definitions:

```typescript
import { createSwaggerServer, SwaglexConfig, SwaglexServer } from 'swaglex';

const config: SwaglexConfig = {
  specPath: './openapi.yaml',
  port: 3001
};

const server: SwaglexServer = createSwaggerServer(config);
server.start();
```

## API

### Functions

#### `createSwaggerServer(config: SwaglexConfig): SwaglexServer`
Create a complete Swagger documentation server.

#### `loadSwaggerSpec(specPath: string): SwaggerSpec`
Load and parse an OpenAPI specification with $ref resolution.

#### `createFallbackSpec(info?: object): SwaggerSpec`
Create a minimal fallback OpenAPI specification.

#### `createJsonEndpoint(spec: SwaggerSpec): RequestHandler`
Create Express middleware to serve the spec as JSON.

#### `createYamlEndpoint(spec: SwaggerSpec): RequestHandler`
Create Express middleware to serve the spec as YAML.

#### `createHealthCheck(options?: object): RequestHandler`
Create a health check endpoint.

#### `createValidationEndpoint(spec: SwaggerSpec): RequestHandler`
Create an API validation endpoint.

#### `createErrorHandler(): ErrorRequestHandler`
Create Express error handling middleware.

#### `create404Handler(endpoints?: string[]): RequestHandler`
Create a 404 not found handler.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.

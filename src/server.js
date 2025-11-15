const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const { loadSwaggerSpec, createFallbackSpec } = require('./loader');
const {
  createJsonEndpoint,
  createYamlEndpoint,
  createHealthCheck,
  createValidationEndpoint,
  createErrorHandler,
  create404Handler
} = require('./middleware');

/**
 * Default Swaglex configuration
 */
const DEFAULT_CONFIG = {
  port: 3001,
  specPath: null,
  cors: true,
  healthCheck: true,
  validation: true,
  redirectRoot: true,
  uiPath: '/api-docs',
  jsonPath: '/api-docs.json',
  yamlPath: '/api-docs.yaml',
  healthPath: '/health',
  validatePath: '/validate',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { color: #2c3e50 }
  `,
  swaggerUiOptions: {
    explorer: true,
    tryItOutEnabled: true
  }
};

/**
 * Create Swaglex server instance
 * @param {Object} config - Server configuration
 * @returns {Object} Server instance with app and methods
 */
function createSwaggerServer(config = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const app = express();
  
  // Middleware setup
  if (settings.cors) {
    app.use(cors(typeof settings.cors === 'object' ? settings.cors : {}));
  }
  app.use(express.json());
  
  // Load swagger specification
  let swaggerSpec;
  try {
    if (!settings.specPath) {
      throw new Error('specPath is required in configuration');
    }
    swaggerSpec = loadSwaggerSpec(settings.specPath);
  } catch (error) {
    console.error('Failed to load specification:', error.message);
    swaggerSpec = createFallbackSpec(settings.fallbackInfo);
  }
  
  // Swagger UI options
  const swaggerOptions = {
    ...settings.swaggerUiOptions,
    swaggerOptions: {
      urls: [
        {
          url: settings.jsonPath,
          name: settings.apiName || swaggerSpec.info?.title || 'API Documentation'
        }
      ],
      ...(settings.swaggerUiOptions.swaggerOptions || {})
    },
    customCss: settings.customCss,
    customSiteTitle: settings.siteTitle || swaggerSpec.info?.title || 'API Documentation'
  };
  
  // Register endpoints
  app.get(settings.jsonPath, createJsonEndpoint(swaggerSpec));
  app.get(settings.yamlPath, createYamlEndpoint(swaggerSpec));
  
  if (settings.healthCheck) {
    app.get(settings.healthPath, createHealthCheck({
      version: swaggerSpec.info?.version,
      extra: settings.healthExtra
    }));
  }
  
  if (settings.validation) {
    app.post(settings.validatePath, createValidationEndpoint(swaggerSpec));
  }
  
  // Serve Swagger UI
  app.use(settings.uiPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
  
  // Root redirect
  if (settings.redirectRoot) {
    app.get('/', (req, res) => {
      res.redirect(settings.uiPath);
    });
  }
  
  // Custom routes
  if (settings.routes && typeof settings.routes === 'function') {
    settings.routes(app, swaggerSpec);
  }
  
  // Error handling
  app.use(createErrorHandler());
  
  // 404 handler
  const availableEndpoints = [
    `GET ${settings.uiPath}`,
    `GET ${settings.jsonPath}`,
    `GET ${settings.yamlPath}`
  ];
  if (settings.healthCheck) availableEndpoints.push(`GET ${settings.healthPath}`);
  if (settings.validation) availableEndpoints.push(`POST ${settings.validatePath}`);
  if (settings.redirectRoot) availableEndpoints.unshift('GET /');
  
  app.use(create404Handler(availableEndpoints));
  
  return {
    app,
    spec: swaggerSpec,
    config: settings,
    start: (port = settings.port, callback) => {
      const serverPort = port || settings.port;
      const server = app.listen(serverPort, () => {
        console.log(`
🚀 Swaglex API Documentation Server is running!

📖 Swagger UI: http://localhost:${serverPort}${settings.uiPath}
📄 OpenAPI JSON: http://localhost:${serverPort}${settings.jsonPath}
📄 OpenAPI YAML: http://localhost:${serverPort}${settings.yamlPath}
${settings.healthCheck ? `❤️  Health Check: http://localhost:${serverPort}${settings.healthPath}` : ''}

Environment: ${process.env.NODE_ENV || 'development'}
Port: ${serverPort}
API: ${swaggerSpec.info?.title || 'Unknown'} v${swaggerSpec.info?.version || '1.0.0'}
        `);
        if (callback) callback(server);
      });
      return server;
    }
  };
}

module.exports = {
  createSwaggerServer,
  DEFAULT_CONFIG
};

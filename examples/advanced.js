const { createSwaggerServer } = require('../src');
const path = require('path');

// Advanced example with custom configuration
const server = createSwaggerServer({
  specPath: path.join(__dirname, '..', 'api', 'openapi.yaml'),
  port: 3002,
  
  // Custom paths
  uiPath: '/docs',
  jsonPath: '/api-spec.json',
  yamlPath: '/api-spec.yaml',
  
  // Custom styling
  apiName: 'Sample Advanced API',
  siteTitle: 'Sample API - Advanced Documentation',
  customCss: `
    .swagger-ui .topbar { 
      background-color: #1a1a2e;
      padding: 20px;
    }
    .swagger-ui .info .title { 
      color: #16213e;
      font-weight: bold;
    }
    .swagger-ui .scheme-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 10px;
    }
  `,
  
  // Swagger UI options
  swaggerUiOptions: {
    explorer: true,
    tryItOutEnabled: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  },
  
  // Health check extras
  healthExtra: {
    service: 'sample-api-docs',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  },
  
  // Custom routes
  routes: (app, spec) => {
    // Custom endpoint to get API statistics
    app.get('/api/stats', (req, res) => {
      const pathCount = Object.keys(spec.paths || {}).length;
      const operations = Object.values(spec.paths || {}).reduce((count, path) => {
        return count + Object.keys(path).filter(key => 
          ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(key)
        ).length;
      }, 0);
      
      res.json({
        apiTitle: spec.info?.title,
        version: spec.info?.version,
        totalPaths: pathCount,
        totalOperations: operations,
        description: spec.info?.description
      });
    });
    
    // Custom endpoint to list all paths
    app.get('/api/paths', (req, res) => {
      const paths = Object.keys(spec.paths || {}).map(path => ({
        path,
        methods: Object.keys(spec.paths[path]).filter(key => 
          ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(key)
        )
      }));
      
      res.json({ paths });
    });
  }
});

server.start(undefined, () => {
  console.log('\n📊 Custom endpoints available:');
  console.log('   GET /api/stats - API statistics');
  console.log('   GET /api/paths - List all paths\n');
});

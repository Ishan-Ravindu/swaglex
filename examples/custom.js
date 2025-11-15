const express = require('express');
const {
  loadSwaggerSpec,
  createJsonEndpoint,
  createYamlEndpoint,
  createHealthCheck,
  createErrorHandler,
  create404Handler
} = require('../src');
const path = require('path');

// Custom server using individual Swaglex components
const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// Load the specification
const spec = loadSwaggerSpec(
  path.join(__dirname, '..', 'api', 'openapi.yaml')
);

// Use individual Swaglex components
app.get('/spec.json', createJsonEndpoint(spec));
app.get('/spec.yaml', createYamlEndpoint(spec));
app.get('/health', createHealthCheck({ 
  version: spec.info?.version,
  extra: { customServer: true }
}));

// Custom endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Custom API Documentation Server',
    endpoints: {
      spec: {
        json: '/spec.json',
        yaml: '/spec.yaml'
      },
      health: '/health',
      info: '/info'
    }
  });
});

app.get('/info', (req, res) => {
  res.json({
    title: spec.info?.title,
    version: spec.info?.version,
    description: spec.info?.description,
    pathCount: Object.keys(spec.paths || {}).length
  });
});

// Error handling
app.use(createErrorHandler());
app.use(create404Handler([
  'GET /',
  'GET /spec.json',
  'GET /spec.yaml',
  'GET /health',
  'GET /info'
]));

// Start server
app.listen(PORT, () => {
  console.log(`
🔧 Custom Swaglex Server

📄 Endpoints:
   GET http://localhost:${PORT}/
   GET http://localhost:${PORT}/spec.json
   GET http://localhost:${PORT}/spec.yaml
   GET http://localhost:${PORT}/health
   GET http://localhost:${PORT}/info
  `);
});

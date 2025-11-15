const { createSwaggerServer } = require('../src');
const path = require('path');

// Basic example
const server = createSwaggerServer({
  specPath: path.join(__dirname, '..', 'api', 'openapi.yaml'),
  port: 3001
});

server.start();

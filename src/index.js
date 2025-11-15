const { createSwaggerServer } = require('./server');
const { loadSwaggerSpec, createFallbackSpec } = require('./loader');
const {
  createJsonEndpoint,
  createYamlEndpoint,
  createHealthCheck,
  createValidationEndpoint,
  createErrorHandler,
  create404Handler
} = require('./middleware');

module.exports = {
  createSwaggerServer,
  loadSwaggerSpec,
  createFallbackSpec,
  createJsonEndpoint,
  createYamlEndpoint,
  createHealthCheck,
  createValidationEndpoint,
  createErrorHandler,
  create404Handler
};

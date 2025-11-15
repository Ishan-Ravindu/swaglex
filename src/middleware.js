const YAML = require('yaml');

/**
 * Create middleware to serve OpenAPI spec as JSON
 * @param {Object} swaggerSpec - The OpenAPI specification object
 * @returns {Function} Express middleware
 */
function createJsonEndpoint(swaggerSpec) {
  return (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  };
}

/**
 * Create middleware to serve OpenAPI spec as YAML
 * @param {Object} swaggerSpec - The OpenAPI specification object
 * @returns {Function} Express middleware
 */
function createYamlEndpoint(swaggerSpec) {
  return (req, res) => {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.send(YAML.stringify(swaggerSpec));
  };
}

/**
 * Create health check endpoint
 * @param {Object} options - Health check options
 * @returns {Function} Express middleware
 */
function createHealthCheck(options = {}) {
  return (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: options.version || '1.0.0',
      ...(options.extra || {})
    });
  };
}

/**
 * Create validation endpoint
 * @param {Object} swaggerSpec - The OpenAPI specification object
 * @returns {Function} Express middleware
 */
function createValidationEndpoint(swaggerSpec) {
  return (req, res) => {
    try {
      res.json({
        valid: true,
        message: 'API specification is valid',
        endpoints: Object.keys(swaggerSpec.paths || {}).length,
        version: swaggerSpec.info?.version || 'unknown'
      });
    } catch (error) {
      res.status(400).json({
        valid: false,
        message: error.message
      });
    }
  };
}

/**
 * Create error handling middleware
 * @returns {Function} Express error middleware
 */
function createErrorHandler() {
  return (error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  };
}

/**
 * Create 404 handler
 * @param {Array<string>} availableEndpoints - List of available endpoints
 * @returns {Function} Express middleware
 */
function create404Handler(availableEndpoints = []) {
  return (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Endpoint ${req.method} ${req.path} not found`,
      availableEndpoints
    });
  };
}

module.exports = {
  createJsonEndpoint,
  createYamlEndpoint,
  createHealthCheck,
  createValidationEndpoint,
  createErrorHandler,
  create404Handler
};

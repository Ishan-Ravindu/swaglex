const YAML = require('yaml');
const fs = require('fs');
const path = require('path');

/**
 * Load and parse OpenAPI specification with $ref resolution
 * @param {string} specPath - Path to the main OpenAPI specification file
 * @returns {Object} Resolved OpenAPI specification
 */
function loadSwaggerSpec(specPath) {
  try {
    const mainSpec = YAML.parse(fs.readFileSync(specPath, 'utf8'));
    const basePath = path.dirname(specPath);
    
    // Simple $ref resolver for local files
    function resolveRefs(obj, currentPath = basePath) {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => resolveRefs(item, currentPath));
      }
      
      const resolved = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$ref' && typeof value === 'string' && value.startsWith('./')) {
          // Extract the file path and the JSON pointer
          const [filePath, pointer] = value.split('#');
          const fullPath = path.resolve(currentPath, filePath);
          
          try {
            const refContent = YAML.parse(fs.readFileSync(fullPath, 'utf8'));
            
            // Navigate to the specific section using the pointer
            if (pointer) {
              const parts = pointer.split('/').filter(p => p !== '');
              let result = refContent;
              for (const part of parts) {
                result = result[part];
              }
              return resolveRefs(result, path.dirname(fullPath));
            } else {
              return resolveRefs(refContent, path.dirname(fullPath));
            }
          } catch (error) {
            console.warn(`Could not resolve $ref: ${value}`, error.message);
            return { $ref: value }; // Keep original $ref if resolution fails
          }
        } else {
          resolved[key] = resolveRefs(value, currentPath);
        }
      }
      
      return resolved;
    }
    
    return resolveRefs(mainSpec);
  } catch (error) {
    console.error('Error loading Swagger specification:', error);
    throw error;
  }
}

/**
 * Create a fallback OpenAPI spec in case of loading errors
 * @param {Object} info - Basic info for the fallback spec
 * @returns {Object} Minimal OpenAPI specification
 */
function createFallbackSpec(info = {}) {
  return {
    openapi: '3.0.3',
    info: {
      title: info.title || 'API Documentation',
      version: info.version || '1.0.0',
      description: info.description || 'Error loading API specification'
    },
    paths: {}
  };
}

module.exports = {
  loadSwaggerSpec,
  createFallbackSpec
};

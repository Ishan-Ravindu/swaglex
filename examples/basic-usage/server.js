const { SwaggerDocsFramework } = require('swaglex');
require('dotenv').config();

// Basic configuration
const config = {
  server: {
    port: 3000,
    host: 'localhost'
  },

  database: {
    dialect: 'sqlite',
    storage: './data/swaglex.db'
  },

  auth: {
    session: {
      secret: 'basic-example-secret-key-change-in-production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    providers: {
      local: {
        enabled: true,
        registration: false
      }
    }
  },

  swagger: {
    title: 'Basic API Documentation',
    description: 'A simple example of Swaglex usage',
    version: '1.0.0',
    docsPath: './docs',
    theme: 'default'
  },

  security: {
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    }
  }
};

// Create and start the server
const app = new SwaggerDocsFramework(config);

app
  .start()
  .then(() => {
    console.log('🚀 Swaglex Basic Example started successfully!');
    console.log('📖 Visit http://localhost:3000 to access your documentation');
    console.log('🔑 Default login: admin@swaglex.local / admin123');
  })
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  app.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  app.stop();
  process.exit(0);
});

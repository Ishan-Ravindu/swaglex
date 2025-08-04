const { SwaggerDocsFramework, Logger, CacheManager } = require('swaglex');
const express = require('express');
require('dotenv').config();

// Advanced configuration
const config = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || true,
      credentials: true
    }
  },

  database: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'swaglex_advanced',
    username: process.env.DB_USER || 'swaglex',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  },

  auth: {
    session: {
      secret: process.env.SESSION_SECRET || 'advanced-example-secret-key',
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    },
    jwt: {
      enabled: process.env.JWT_ENABLED === 'true',
      secret: process.env.JWT_SECRET || 'jwt-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256'
    },
    providers: {
      local: {
        enabled: true,
        registration: process.env.ALLOW_REGISTRATION === 'true',
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        }
      },
      oauth: {
        google: {
          enabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackUrl: process.env.GOOGLE_CALLBACK_URL
        }
      }
    }
  },

  swagger: {
    title: 'Advanced E-commerce API',
    description: 'Comprehensive API documentation for e-commerce platform',
    version: '2.0.0',
    docsPath: './docs',
    theme: process.env.SWAGGER_THEME || 'dark',
    customCss: `
      .swagger-ui .topbar { 
        background-color: #1e3a8a; 
      }
      .swagger-ui .info .title {
        color: #3b82f6;
      }
    `,
    deepLinking: true,
    displayRequestDuration: true,
    docExpansion: 'list'
  },

  security: {
    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      windowMs: parseInt(process.env.RATE_LIMITING_WINDOW_MS) || 15 * 60 * 1000,
      maxRequests: parseInt(process.env.RATE_LIMITING_MAX_REQUESTS) || 1000,
      message: 'Too many requests from this IP, please try again later'
    },
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false',
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"]
        }
      }
    }
  },

  features: {
    caching: {
      enabled: process.env.CACHING_ENABLED !== 'false',
      provider: process.env.CACHING_PROVIDER || 'redis',
      ttl: parseInt(process.env.CACHING_TTL) || 300,
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0
      }
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      file: {
        enabled: process.env.LOG_FILE_ENABLED === 'true',
        filename: process.env.LOG_FILE_NAME || './logs/swaglex-%DATE%.log',
        maxsize: '20m',
        maxFiles: '14d',
        datePattern: 'YYYY-MM-DD'
      }
    },
    analytics: {
      enabled: process.env.ANALYTICS_ENABLED === 'true',
      provider: process.env.ANALYTICS_PROVIDER || 'google',
      trackingId: process.env.ANALYTICS_TRACKING_ID
    }
  }
};

// Initialize logger
const logger = new Logger(config.features.logging);

// Initialize cache
const cache = new CacheManager(config.features.caching);

// Create Swaglex app
const app = new SwaggerDocsFramework(config);

// Add custom middleware for health checks
app.app.get('/api/health', cache.middleware(60), async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Check database connection
    try {
      const { getDB } = require('swaglex/lib/core/database');
      const db = getDB();
      await db.authenticate();
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check cache connection
    try {
      await cache.set('health-check', 'ok', 10);
      const cacheStatus = await cache.get('health-check');
      health.cache = cacheStatus === 'ok' ? 'connected' : 'disconnected';
    } catch (error) {
      health.cache = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

    logger.info('Health check performed', {
      status: health.status,
      ip: req.ip
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Add metrics endpoint
app.app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      loadAverage: require('os').loadavg(),
      platform: process.platform,
      nodeVersion: process.version
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics endpoint failed', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Custom error handler
app.app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
});

// Start the server
app
  .start()
  .then(() => {
    logger.info('🚀 Swaglex Advanced Example started successfully!', {
      port: config.server.port,
      environment: process.env.NODE_ENV || 'development',
      database: config.database.dialect,
      caching: config.features.caching.provider,
      jwt: config.auth.jwt.enabled
    });

    console.log('🚀 Swaglex Advanced Example started successfully!');
    console.log(`📖 Visit http://localhost:${config.server.port} to access your documentation`);
    console.log(`🔍 Health check: http://localhost:${config.server.port}/api/health`);
    console.log(`📊 Metrics: http://localhost:${config.server.port}/api/metrics`);
    console.log('🔑 Default login: admin@swaglex.local / admin123');
  })
  .catch(error => {
    logger.error('❌ Failed to start server', { error: error.message });
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = signal => {
  console.log(`${signal} received, shutting down gracefully...`);
  logger.info('Graceful shutdown initiated', { signal });

  app.stop();

  // Close cache connection
  if (cache.cache && cache.cache.quit) {
    cache.cache.quit();
  }

  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 1000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason, promise });
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

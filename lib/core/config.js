const path = require('path')
const fs = require('fs-extra')
const { configSchema } = require('./config-schema')

class Config {
  static async load (configPath = './swaglex.config.js') {
    const fullPath = path.resolve(configPath)

    let userConfig = {}

    // Try to load user config
    if (await fs.pathExists(fullPath)) {
      try {
        userConfig = require(fullPath)
      } catch (error) {
        console.warn(`Warning: Failed to load config from ${fullPath}:`, error.message)
      }
    }

    // Merge with defaults and validate
    const config = this.mergeWithDefaults(userConfig)
    return this.validate(config)
  }

  static mergeWithDefaults (userConfig) {
    const defaults = this.getDefaults()
    return this.deepMerge(defaults, userConfig)
  }

  static deepMerge (target, source) {
    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  static getDefaults () {
    return {
      server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        cors: {
          origin: process.env.CORS_ORIGIN || true,
          credentials: true
        }
      },
      database: {
        dialect: process.env.DB_DIALECT || 'sqlite',
        storage: process.env.DB_STORAGE || './data/swaglex.db',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
        pool: {
          max: parseInt(process.env.DB_POOL_MAX) || 5,
          min: parseInt(process.env.DB_POOL_MIN) || 0,
          acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
          idle: parseInt(process.env.DB_POOL_IDLE) || 10000
        }
      },
      auth: {
        session: {
          secret: process.env.SESSION_SECRET || this.generateSecureSecret(),
          maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: process.env.SESSION_SAME_SITE || 'lax'
        },
        jwt: {
          enabled: process.env.JWT_ENABLED === 'true',
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          algorithm: process.env.JWT_ALGORITHM || 'HS256'
        },
        providers: {
          local: {
            enabled: true,
            registration: process.env.ALLOW_REGISTRATION === 'true',
            passwordPolicy: {
              minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
              requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
              requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
              requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
              requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true'
            }
          },
          oauth: {
            google: {
              enabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL
            },
            github: {
              enabled: process.env.GITHUB_AUTH_ENABLED === 'true',
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
              callbackUrl: process.env.GITHUB_CALLBACK_URL
            }
          }
        }
      },
      swagger: {
        title: process.env.SWAGGER_TITLE || 'API Documentation',
        description: process.env.SWAGGER_DESCRIPTION || 'Swagger API Documentation',
        version: process.env.SWAGGER_VERSION || '1.0.0',
        docsPath: process.env.SWAGGER_DOCS_PATH || './docs',
        uiPath: process.env.SWAGGER_UI_PATH || '/docs',
        apiPath: process.env.SWAGGER_API_PATH || '/api-docs',
        theme: process.env.SWAGGER_THEME || 'default',
        customCss: process.env.SWAGGER_CUSTOM_CSS || '',
        customJs: process.env.SWAGGER_CUSTOM_JS || '',
        deepLinking: process.env.SWAGGER_DEEP_LINKING !== 'false',
        displayOperationId: process.env.SWAGGER_DISPLAY_OPERATION_ID === 'true',
        defaultModelsExpandDepth: parseInt(process.env.SWAGGER_DEFAULT_MODELS_EXPAND_DEPTH) || 1,
        defaultModelExpandDepth: parseInt(process.env.SWAGGER_DEFAULT_MODEL_EXPAND_DEPTH) || 1,
        displayRequestDuration: process.env.SWAGGER_DISPLAY_REQUEST_DURATION === 'true',
        docExpansion: process.env.SWAGGER_DOC_EXPANSION || 'list',
        filter: process.env.SWAGGER_FILTER === 'true' ? true : process.env.SWAGGER_FILTER || false,
        maxDisplayedTags: parseInt(process.env.SWAGGER_MAX_DISPLAYED_TAGS) || -1,
        showExtensions: process.env.SWAGGER_SHOW_EXTENSIONS === 'true',
        showCommonExtensions: process.env.SWAGGER_SHOW_COMMON_EXTENSIONS === 'true',
        useUnsafeMarkdown: process.env.SWAGGER_USE_UNSAFE_MARKDOWN === 'true'
      },
      security: {
        rateLimiting: {
          enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
          windowMs: parseInt(process.env.RATE_LIMITING_WINDOW_MS) || 900000,
          maxRequests: parseInt(process.env.RATE_LIMITING_MAX_REQUESTS) || 100,
          message: process.env.RATE_LIMITING_MESSAGE || 'Too many requests, please try again later',
          standardHeaders: process.env.RATE_LIMITING_STANDARD_HEADERS !== 'false',
          legacyHeaders: process.env.RATE_LIMITING_LEGACY_HEADERS === 'true'
        },
        helmet: {
          enabled: process.env.HELMET_ENABLED !== 'false',
          contentSecurityPolicy: process.env.HELMET_CSP !== 'false',
          crossOriginEmbedderPolicy: process.env.HELMET_COEP === 'true'
        },
        csrf: {
          enabled: process.env.CSRF_ENABLED === 'true',
          secret: process.env.CSRF_SECRET
        }
      },
      features: {
        multiTenancy: {
          enabled: process.env.MULTI_TENANCY_ENABLED === 'true',
          strategy: process.env.MULTI_TENANCY_STRATEGY || 'subdomain',
          defaultTenant: process.env.MULTI_TENANCY_DEFAULT_TENANT
        },
        analytics: {
          enabled: process.env.ANALYTICS_ENABLED === 'true',
          provider: process.env.ANALYTICS_PROVIDER,
          trackingId: process.env.ANALYTICS_TRACKING_ID
        },
        caching: {
          enabled: process.env.CACHING_ENABLED !== 'false',
          provider: process.env.CACHING_PROVIDER || 'memory',
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
          format: process.env.LOG_FORMAT || 'simple',
          file: {
            enabled: process.env.LOG_FILE_ENABLED === 'true',
            filename: process.env.LOG_FILE_NAME || './logs/swaglex.log',
            maxsize: parseInt(process.env.LOG_FILE_MAX_SIZE) || 5242880,
            maxFiles: parseInt(process.env.LOG_FILE_MAX_FILES) || 5,
            datePattern: process.env.LOG_FILE_DATE_PATTERN || 'YYYY-MM-DD'
          }
        }
      }
    }
  }

  static validate (config) {
    const { error, value } = configSchema.validate(config, {
      allowUnknown: false,
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => detail.message)
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
    }

    // Additional custom validation
    this.validateCustomRules(value)

    return value
  }

  static validateCustomRules (config) {
    const errors = []

    // Validate session secret strength
    if (config.auth.session.secret.length < 32) {
      errors.push('Session secret must be at least 32 characters long')
    }

    // Validate JWT secret if JWT is enabled
    if (
      config.auth.jwt.enabled &&
      (!config.auth.jwt.secret || config.auth.jwt.secret.length < 32)
    ) {
      errors.push('JWT secret must be at least 32 characters long when JWT is enabled')
    }

    // Validate OAuth configuration
    const { google, github } = config.auth.providers.oauth
    if (google.enabled && (!google.clientId || !google.clientSecret)) {
      errors.push('Google OAuth requires clientId and clientSecret when enabled')
    }
    if (github.enabled && (!github.clientId || !github.clientSecret)) {
      errors.push('GitHub OAuth requires clientId and clientSecret when enabled')
    }

    // Validate multi-tenancy configuration
    if (config.features.multiTenancy.enabled && !config.features.multiTenancy.defaultTenant) {
      errors.push('Multi-tenancy requires a default tenant when enabled')
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
    }
  }

  static generateSecureSecret () {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let result = ''
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static async generateConfigFile (outputPath = './swaglex.config.js') {
    const template = `module.exports = {
  server: {
    port: 3000,
    host: 'localhost',
    cors: {
      origin: true,
      credentials: true
    }
  },

  database: {
    dialect: 'sqlite',
    storage: './data/swaglex.db'
    // For other databases:
    // dialect: 'postgres',
    // host: 'localhost',
    // port: 5432,
    // database: 'swaglex',
    // username: 'postgres',
    // password: 'password'
  },

  auth: {
    session: {
      secret: '${this.generateSecureSecret()}', // Change this in production!
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    providers: {
      local: {
        enabled: true,
        registration: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        }
      }
    }
  },

  swagger: {
    title: 'API Documentation',
    description: 'Swagger API Documentation powered by Swaglex',
    version: '1.0.0',
    docsPath: './docs',
    theme: 'default'
  },

  security: {
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    },
    helmet: {
      enabled: true
    }
  },

  features: {
    caching: {
      enabled: true,
      provider: 'memory',
      ttl: 300 // 5 minutes
    },
    logging: {
      level: 'info',
      format: 'simple'
    }
  }
};`

    await fs.writeFile(outputPath, template)
    return outputPath
  }
}

module.exports = Config

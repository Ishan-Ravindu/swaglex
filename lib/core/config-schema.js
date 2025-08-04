const Joi = require('joi')

const configSchema = Joi.object({
  server: Joi.object({
    port: Joi.number().integer().min(1).max(65535).default(3000),
    host: Joi.string().default('localhost'),
    cors: Joi.object({
      origin: Joi.alternatives()
        .try(Joi.boolean(), Joi.string(), Joi.array().items(Joi.string()))
        .default(true),
      credentials: Joi.boolean().default(true),
      methods: Joi.array().items(Joi.string()).default(['GET', 'POST', 'PUT', 'DELETE']),
      allowedHeaders: Joi.array().items(Joi.string()).optional()
    }).default({})
  }).default({}),

  database: Joi.object({
    dialect: Joi.string().valid('sqlite', 'mysql', 'mariadb', 'postgres').default('sqlite'),
    host: Joi.string().when('dialect', {
      is: 'sqlite',
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    port: Joi.number().integer().when('dialect', {
      is: 'sqlite',
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    database: Joi.string().when('dialect', {
      is: 'sqlite',
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    username: Joi.string().when('dialect', {
      is: 'sqlite',
      then: Joi.optional(),
      otherwise: Joi.required()
    }),
    password: Joi.string().when('dialect', {
      is: 'sqlite',
      then: Joi.optional(),
      otherwise: Joi.allow('')
    }),
    storage: Joi.string().when('dialect', {
      is: 'sqlite',
      then: Joi.string().default('./data/swaglex.db'),
      otherwise: Joi.optional()
    }),
    ssl: Joi.boolean().default(false),
    pool: Joi.object({
      max: Joi.number().integer().min(1).default(5),
      min: Joi.number().integer().min(0).default(0),
      acquire: Joi.number().integer().min(1000).default(30000),
      idle: Joi.number().integer().min(1000).default(10000)
    }).default({})
  }).required(),

  auth: Joi.object({
    session: Joi.object({
      secret: Joi.string().min(32).required(),
      maxAge: Joi.number().integer().min(60000).default(86400000), // 24 hours
      secure: Joi.boolean().default(false),
      httpOnly: Joi.boolean().default(true),
      sameSite: Joi.string().valid('strict', 'lax', 'none').default('lax')
    }).required(),
    jwt: Joi.object({
      enabled: Joi.boolean().default(false),
      secret: Joi.string().min(32).when('enabled', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      expiresIn: Joi.string().default('24h'),
      algorithm: Joi.string()
        .valid('HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512')
        .default('HS256')
    }).default({}),
    providers: Joi.object({
      local: Joi.object({
        enabled: Joi.boolean().default(true),
        registration: Joi.boolean().default(false),
        passwordPolicy: Joi.object({
          minLength: Joi.number().integer().min(6).default(8),
          requireUppercase: Joi.boolean().default(true),
          requireLowercase: Joi.boolean().default(true),
          requireNumbers: Joi.boolean().default(true),
          requireSpecialChars: Joi.boolean().default(false)
        }).default({})
      }).default({}),
      oauth: Joi.object({
        google: Joi.object({
          enabled: Joi.boolean().default(false),
          clientId: Joi.string().when('enabled', { is: true, then: Joi.required() }),
          clientSecret: Joi.string().when('enabled', { is: true, then: Joi.required() }),
          callbackUrl: Joi.string().when('enabled', { is: true, then: Joi.required() })
        }).default({}),
        github: Joi.object({
          enabled: Joi.boolean().default(false),
          clientId: Joi.string().when('enabled', { is: true, then: Joi.required() }),
          clientSecret: Joi.string().when('enabled', { is: true, then: Joi.required() }),
          callbackUrl: Joi.string().when('enabled', { is: true, then: Joi.required() })
        }).default({})
      }).default({})
    }).default({})
  }).required(),

  swagger: Joi.object({
    title: Joi.string().default('API Documentation'),
    description: Joi.string().default('Swagger API Documentation'),
    version: Joi.string().default('1.0.0'),
    docsPath: Joi.string().default('./docs'),
    uiPath: Joi.string().default('/docs'),
    apiPath: Joi.string().default('/api-docs'),
    theme: Joi.string()
      .valid(
        'default',
        'dark',
        'outline',
        'feeling-blue',
        'flattop',
        'material',
        'monokai',
        'muted',
        'newspaper',
        'outline'
      )
      .default('default'),
    customCss: Joi.string().default(''),
    customJs: Joi.string().default(''),
    deepLinking: Joi.boolean().default(true),
    displayOperationId: Joi.boolean().default(false),
    defaultModelsExpandDepth: Joi.number().integer().min(-1).default(1),
    defaultModelExpandDepth: Joi.number().integer().min(-1).default(1),
    displayRequestDuration: Joi.boolean().default(false),
    docExpansion: Joi.string().valid('list', 'full', 'none').default('list'),
    filter: Joi.alternatives().try(Joi.boolean(), Joi.string()).default(false),
    maxDisplayedTags: Joi.number().integer().min(-1).default(-1),
    showExtensions: Joi.boolean().default(false),
    showCommonExtensions: Joi.boolean().default(false),
    useUnsafeMarkdown: Joi.boolean().default(false)
  }).default({}),

  security: Joi.object({
    rateLimiting: Joi.object({
      enabled: Joi.boolean().default(true),
      windowMs: Joi.number().integer().min(1000).default(900000), // 15 minutes
      maxRequests: Joi.number().integer().min(1).default(100),
      message: Joi.string().default('Too many requests, please try again later'),
      standardHeaders: Joi.boolean().default(true),
      legacyHeaders: Joi.boolean().default(false)
    }).default({}),
    helmet: Joi.object({
      enabled: Joi.boolean().default(true),
      contentSecurityPolicy: Joi.alternatives().try(Joi.boolean(), Joi.object()).default(false),
      crossOriginEmbedderPolicy: Joi.boolean().default(false)
    }).default({}),
    csrf: Joi.object({
      enabled: Joi.boolean().default(false),
      secret: Joi.string().when('enabled', { is: true, then: Joi.required() })
    }).default({})
  }).default({}),

  features: Joi.object({
    multiTenancy: Joi.object({
      enabled: Joi.boolean().default(false),
      strategy: Joi.string()
        .valid('subdomain', 'path', 'header')
        .default('subdomain')
        .when('enabled', { is: true, then: Joi.required() }),
      defaultTenant: Joi.string().when('enabled', { is: true, then: Joi.required() })
    }).default({}),
    analytics: Joi.object({
      enabled: Joi.boolean().default(false),
      provider: Joi.string()
        .valid('google', 'mixpanel', 'amplitude')
        .when('enabled', { is: true, then: Joi.required() }),
      trackingId: Joi.string().when('enabled', { is: true, then: Joi.required() })
    }).default({}),
    caching: Joi.object({
      enabled: Joi.boolean().default(true),
      provider: Joi.string().valid('memory', 'redis').default('memory'),
      ttl: Joi.number().integer().min(1).default(300), // 5 minutes
      redis: Joi.object({
        host: Joi.string().default('localhost'),
        port: Joi.number().integer().default(6379),
        password: Joi.string().optional(),
        db: Joi.number().integer().min(0).default(0)
      }).when('provider', { is: 'redis', then: Joi.required() })
    }).default({}),
    logging: Joi.object({
      level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
      format: Joi.string().valid('json', 'simple').default('simple'),
      file: Joi.object({
        enabled: Joi.boolean().default(false),
        filename: Joi.string().default('./logs/swaglex.log'),
        maxsize: Joi.number().integer().default(5242880), // 5MB
        maxFiles: Joi.number().integer().default(5),
        datePattern: Joi.string().default('YYYY-MM-DD')
      }).default({})
    }).default({})
  }).default({})
})

module.exports = { configSchema }

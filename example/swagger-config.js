module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // Database configuration
  database: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './data/swagger-docs.db',
    // For other databases:
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Swagger configuration
  swagger: {
    docsPath: './docs',
    defaultAccess: 'authenticated', // 'public' or 'authenticated'
    theme: 'default',
    customCss: '',
    customSiteTitle: 'API Documentation'
  },
  
  // Authentication settings
  auth: {
    allowRegistration: false,
    requireEmailVerification: false,
    passwordMinLength: 6,
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // CORS settings
  cors: {
    origin: true,
    credentials: true
  }
};
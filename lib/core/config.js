const path = require('path');
const fs = require('fs-extra');

class Config {
  static async load(configPath = './swagger-config.js') {
    const fullPath = path.resolve(configPath);
    
    if (await fs.pathExists(fullPath)) {
      return require(fullPath);
    }
    
    return this.getDefaults();
  }
  
  static getDefaults() {
    return {
      port: process.env.PORT || 3000,
      database: {
        dialect: process.env.DB_DIALECT || 'sqlite',
        storage: process.env.DB_STORAGE || './data/swagger-docs.db',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      },
      session: {
        secret: process.env.SESSION_SECRET || 'swagger-docs-secret-key',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      swagger: {
        docsPath: './docs',
        defaultAccess: 'authenticated', // or 'public'
        theme: 'default'
      }
    };
  }
  
  static validate(config) {
    const errors = [];
    
    if (!config.database) {
      errors.push('Database configuration is required');
    }
    
    if (!config.session?.secret || config.session.secret === 'swagger-docs-secret-key') {
      errors.push('Please set a secure session secret');
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }
    
    return true;
  }
}

module.exports = Config;
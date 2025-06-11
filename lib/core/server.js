const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const yamljs = require('yamljs');
const { initDB } = require('./database');
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const docsRoutes = require('../routes/docs');
const userRoutes = require('../routes/users');
const { authenticate } = require('../middleware/authentication');
const { authorize } = require('../middleware/authorization');

class SwaggerDocsFramework {
  constructor(config = {}) {
    this.app = express();
    this.config = {
      port: config.port || 3000,
      database: config.database || {
        dialect: 'sqlite',
        storage: './data/swagger-docs.db'
      },
      sessionSecret: config.sessionSecret || 'swagger-docs-secret',
      docsPath: config.docsPath || './docs',
      ...config
    };
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    this.app.use(cors({
      origin: true,
      credentials: true
    }));
    
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Session management
    this.app.use(session({
      secret: this.config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: new SQLiteStore({
        db: 'sessions.db',
        dir: './data'
      }),
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      }
    }));
    
    // Serve static files
    this.app.use('/admin', express.static(path.join(__dirname, '../ui/admin')));
    this.app.use('/login', express.static(path.join(__dirname, '../ui/login')));
  }
  
  setupRoutes() {
    // Store config in app locals
    this.app.locals.docsPath = this.config.docsPath;
    
    // Auth routes
    this.app.use('/api/auth', authRoutes);
    
    // Admin routes (protected)
    this.app.use('/api/admin', authenticate, authorize('admin'), adminRoutes);
    
    // User management routes
    this.app.use('/api/users', authenticate, userRoutes);
    
    // Documentation routes
    this.app.use('/api/docs', authenticate, docsRoutes);
    
    // Swagger UI routes
    this.setupSwaggerRoutes();
    
    // Root redirect
    this.app.get('/', (req, res) => {
      if (req.session.user) {
        res.redirect('/docs');
      } else {
        res.redirect('/login');
      }
    });
  }
  
  setupSwaggerRoutes() {
    const fs = require('fs');
    const docsPath = this.config.docsPath;
    
    // List all available docs
    this.app.get('/docs', authenticate, (req, res) => {
      const files = fs.readdirSync(docsPath)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>API Documentation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .doc-list { list-style: none; padding: 0; }
            .doc-item { 
              margin: 10px 0; 
              padding: 15px; 
              background: #f5f5f5; 
              border-radius: 5px;
            }
            .doc-item a { 
              text-decoration: none; 
              color: #333; 
              font-weight: bold; 
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              margin-bottom: 30px;
            }
            .nav-links a { margin-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>API Documentation</h1>
            <div class="nav-links">
              ${req.session.user.role === 'admin' ? '<a href="/admin">Admin Panel</a>' : ''}
              <a href="/api/auth/logout">Logout</a>
            </div>
          </div>
          <ul class="doc-list">
            ${files.map(file => `
              <li class="doc-item">
                <a href="/docs/${file.replace(/\.(yaml|yml)$/, '')}">${file}</a>
              </li>
            `).join('')}
          </ul>
        </body>
        </html>
      `;
      
      res.send(html);
    });
    
    // Serve individual swagger docs
    this.app.get('/docs/:docName', authenticate, async (req, res, next) => {
      const { docName } = req.params;
      const docPath = path.join(docsPath, `${docName}.yaml`);
      
      // Check if user has access to this document
      const hasAccess = await this.checkDocumentAccess(req.session.user, docName);
      if (!hasAccess) {
        return res.status(403).send('Access denied to this document');
      }
      
      try {
        const swaggerDocument = yamljs.load(docPath);
        swaggerUi.setup(swaggerDocument)(req, res, next);
      } catch (error) {
        res.status(404).send('Document not found');
      }
    });
    
    // Serve Swagger UI assets
    this.app.use('/docs/:docName', authenticate, swaggerUi.serve);
  }
  
  async checkDocumentAccess(user, docName) {
    // Implement document-level access control
    // For now, allow all authenticated users
    return true;
  }
  
  async start() {
    try {
      await initDB(this.config.database);
      
      this.server = this.app.listen(this.config.port, () => {
        console.log(`Swagger Docs Framework running on http://localhost:${this.config.port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  
  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = SwaggerDocsFramework;
# Swaglex 🚀

[![npm version](https://badge.fury.io/js/swaglex.svg)](https://badge.fury.io/js/swaglex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/swaglex/swaglex/workflows/Node.js%20CI/badge.svg)](https://github.com/swaglex/swaglex/actions)
[![codecov](https://codecov.io/gh/swaglex/swaglex/branch/main/graph/badge.svg)](https://codecov.io/gh/swaglex/swaglex)

> **Production-ready Swagger documentation framework with enterprise features**

Swaglex is a comprehensive, enterprise-grade framework for building and managing Swagger/OpenAPI documentation with advanced authentication, role-based access control, multi-tenancy, and professional deployment features.

## ✨ Features

### 🔐 **Advanced Authentication & Security**

- **Multiple Auth Providers**: Local, OAuth (Google, GitHub), JWT
- **Role-Based Access Control (RBAC)**: Fine-grained permissions
- **Document-Level Security**: Control access per API documentation
- **Session Management**: Secure session handling with multiple stores
- **Rate Limiting**: Configurable request throttling
- **Security Headers**: Helmet.js integration with CSP
- **Input Validation**: Comprehensive request validation

### 📚 **Documentation Management**

- **Multi-Document Support**: Organize APIs by version, service, or team
- **Dynamic Loading**: Hot-reload documentation changes
- **Custom Themes**: Multiple built-in themes + custom CSS/JS
- **Advanced UI**: Enhanced Swagger UI with additional features
- **Version Control**: Track documentation changes
- **Bulk Operations**: Import/export multiple API specs

### 🏢 **Enterprise Features**

- **Multi-Tenancy**: Support for multiple organizations/tenants
- **Analytics Integration**: Track usage with Google Analytics, Mixpanel
- **Audit Logging**: Comprehensive access and change logs
- **High Availability**: Redis clustering, database pooling
- **Performance**: Built-in caching (Memory/Redis)
- **Monitoring**: Health checks, metrics, alerting

### 🗄️ **Database Support**

- **SQLite** (Zero-config, perfect for development)
- **PostgreSQL** (Recommended for production)
- **MySQL/MariaDB** (Full feature support)
- **Connection Pooling** (Optimized performance)
- **Migrations** (Database versioning)

### 🛠️ **Developer Experience**

- **CLI Tools**: Project scaffolding, user management, migrations
- **Hot Reload**: Development-friendly auto-refresh
- **TypeScript Support**: Full type definitions
- **Plugin System**: Extensible architecture
- **Docker Ready**: Container-optimized builds
- **Testing**: Comprehensive test suite

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI access
npm install -g swaglex

# Or install locally in your project
npm install swaglex
```

### Create Your First Project

```bash
# Initialize a new project
swaglex init my-api-docs

# Navigate to project
cd my-api-docs

# Install dependencies
npm install

# Setup database
npm run setup

# Start the server
npm start
```

🌐 **Access your documentation at**: `http://localhost:3000`

### Default Credentials

- **Email**: `admin@swaglex.local`
- **Password**: `admin123`

⚠️ **Important**: Change the default credentials after first login!

## 💻 Local Development & Examples

If you're exploring the framework or contributing to development, use our comprehensive examples:

### Quick Setup (All Examples)

```bash
# Clone the repository
git clone https://github.com/username/swaglex.git
cd swaglex

# Run the setup script
./setup-examples.sh
```

### Individual Examples

#### 1. **Basic Usage** (SQLite + Simple Setup)

Perfect for quick prototyping and learning:

```bash
cd examples/basic-usage
npm install
npm start
# Visit http://localhost:3000/docs
```

#### 2. **Advanced Features** (PostgreSQL + Redis + OAuth)

Enterprise-ready setup with all features:

```bash
cd examples/advanced-features
cp .env.example .env
# Configure your database and OAuth settings in .env
npm install
npm run setup
npm start
# Visit http://localhost:3000/docs
```

#### 3. **Docker Deployment** (Production Ready)

Complete containerized stack:

```bash
cd examples/docker-deployment
cp .env.example .env
# Configure your production settings in .env
docker-compose up -d
# Visit http://localhost/docs
```

### Example Features Demonstrated

- 🗃️ **Multiple databases**: SQLite, PostgreSQL, MySQL, MariaDB
- 🔐 **Authentication options**: JWT, OAuth (Google/GitHub), Basic Auth
- 📊 **Caching strategies**: Memory, Redis distributed caching
- 🛡️ **Security features**: Rate limiting, CORS, Helmet.js, input validation
- 📈 **Monitoring**: Health checks, metrics, logging with Winston
- 🐳 **Deployment**: Docker, Docker Compose, Kubernetes manifests

## 📋 Configuration

### Basic Configuration

Create a `swaglex.config.js` file:

```javascript
module.exports = {
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
      secret: 'your-super-secret-key-min-32-chars',
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
    title: 'My API Documentation',
    theme: 'default',
    docsPath: './docs'
  }
};
```

### Production Configuration

```javascript
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  },

  database: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  auth: {
    session: {
      secret: process.env.SESSION_SECRET,
      secure: true
    },
    jwt: {
      enabled: true,
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    providers: {
      oauth: {
        google: {
          enabled: true,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }
      }
    }
  },

  security: {
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000,
      maxRequests: 1000
    },
    helmet: {
      enabled: true
    }
  },

  features: {
    multiTenancy: {
      enabled: true,
      strategy: 'subdomain'
    },
    caching: {
      enabled: true,
      provider: 'redis',
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    },
    analytics: {
      enabled: true,
      provider: 'google',
      trackingId: process.env.GA_TRACKING_ID
    }
  }
};
```

## 🔧 CLI Commands

### Project Management

```bash
# Initialize new project with options
swaglex init my-project --template enterprise --database postgres

# Generate configuration file
swaglex config --output ./config/swaglex.config.js

# Validate configuration
swaglex validate-config
```

### User Management

```bash
# Create admin user
swaglex create-admin --email admin@example.com --password SecurePassword123

# Create regular user
swaglex create-user --email user@example.com --role user
```

### Documentation

```bash
# Add new API documentation
swaglex add-doc users-api --template rest

# Import existing OpenAPI spec
swaglex add-doc payments-api --file ./specs/payments.yaml

# List all documentation
swaglex list-docs
```

### Database Operations

```bash
# Run migrations
swaglex db:migrate

# Reset database (development only)
swaglex db:reset

# Backup database
swaglex db:backup --output ./backups/
```

## 📖 API Reference

### Core Classes

#### SwaggerDocsFramework

```javascript
const { SwaggerDocsFramework } = require('swaglex');

const app = new SwaggerDocsFramework({
  server: { port: 3000 },
  database: { dialect: 'sqlite' }
});

await app.start();
```

#### Authentication Methods

```javascript
const { auth } = require('swaglex');

// Create user
const user = await auth.createUser({
  email: 'user@example.com',
  password: 'password123',
  role: 'user'
});

// Authenticate user
const authenticated = await auth.login('user@example.com', 'password123');
```

### REST API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info
- `POST /api/auth/refresh` - Refresh JWT token

#### User Management (Admin)

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - System statistics

#### Documentation

- `GET /api/docs` - List all documentation
- `GET /api/docs/:name` - Get specific documentation
- `PUT /api/docs/:name` - Update documentation metadata
- `POST /api/docs/:name/versions` - Create new version

#### System

- `GET /api/health` - Health check
- `GET /api/metrics` - System metrics
- `GET /api/version` - Application version

## 🎨 Themes & Customization

### Built-in Themes

- `default` - Clean, professional look
- `dark` - Dark mode theme
- `material` - Material Design inspired
- `outline` - Minimalist outline style
- `monokai` - Developer-friendly dark theme

### Custom Styling

```javascript
// In your config
swagger: {
  theme: 'dark',
  customCss: `
    .swagger-ui .topbar {
      background-color: #1e3a8a;
    }
    .swagger-ui .info .title {
      color: #3b82f6;
    }
  `,
  customJs: `
    console.log('Custom Swaglex theme loaded');
  `
}
```

## 🐳 Docker Deployment

### Basic Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  swaglex:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_DIALECT=postgres
      - DB_HOST=postgres
      - DB_NAME=swaglex
      - DB_USER=swaglex
      - DB_PASSWORD=secure_password
      - SESSION_SECRET=your-secure-session-secret
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=swaglex
      - POSTGRES_USER=swaglex
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 🔒 Security Best Practices

### 1. Authentication Configuration

```javascript
auth: {
  session: {
    secret: process.env.SESSION_SECRET, // 64+ character random string
    secure: true, // HTTPS only
    httpOnly: true,
    sameSite: 'strict'
  },
  providers: {
    local: {
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    }
  }
}
```

### 2. Rate Limiting

```javascript
security: {
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // per window
    message: 'Too many requests'
  }
}
```

### 3. HTTPS Configuration

```javascript
server: {
  https: {
    enabled: true,
    cert: fs.readFileSync('/path/to/cert.pem'),
    key: fs.readFileSync('/path/to/key.pem')
  }
}
```

## 📊 Monitoring & Analytics

### Health Checks

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2023-12-01T10:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "cache": "connected",
  "version": "1.0.0"
}
```

### Metrics Endpoint

```bash
curl http://localhost:3000/api/metrics
```

### Analytics Integration

```javascript
features: {
  analytics: {
    enabled: true,
    provider: 'google',
    trackingId: 'GA-XXXXX-X',
    events: {
      documentView: true,
      userLogin: true,
      apiCall: true
    }
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run specific test suite
npm test -- --testNamePattern="Authentication"
```

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['lib/**/*.js', '!lib/**/*.test.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/swaglex/swaglex.git
cd swaglex

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

### Code Standards

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: [https://docs.swaglex.dev](https://docs.swaglex.dev)
- 💬 **Discord**: [Join our community](https://discord.gg/swaglex)
- 🐛 **Issues**: [GitHub Issues](https://github.com/swaglex/swaglex/issues)
- 📧 **Email**: support@swaglex.dev

## 🙏 Acknowledgments

Built with ❤️ using:

- [Express.js](https://expressjs.com/) - Web framework
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - API documentation UI
- [Sequelize](https://sequelize.org/) - Database ORM
- [Passport.js](http://www.passportjs.org/) - Authentication middleware
- [Winston](https://github.com/winstonjs/winston) - Logging library

---

**Made with 🚀 by the Swaglex Team**

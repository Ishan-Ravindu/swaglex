# Docker Deployment Example

This example demonstrates how to deploy a Swaglex application using Docker and Docker Compose with production-ready configuration.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Swaglex App   │    │   PostgreSQL    │
│    (Nginx)      │◄──►│   (Node.js)     │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │              ┌─────────────────┐              │
        │              │     Redis       │              │
        └─────────────►│    Cache        │◄─────────────┘
                       │                 │
                       └─────────────────┘
```

## 🚀 Quick Start

1. **Clone and navigate to this example:**

   ```bash
   cd examples/docker-deployment
   ```

2. **Copy environment configuration:**

   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

3. **Start the complete stack:**

   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - API: http://localhost:3000
   - Swagger UI: http://localhost:3000/docs
   - Admin Panel: http://localhost:3000/admin
   - Nginx (Load Balancer): http://localhost:80

## 📁 File Structure

```
docker-deployment/
├── README.md                 # This file
├── Dockerfile               # Application container
├── docker-compose.yml       # Multi-service orchestration
├── docker-compose.prod.yml  # Production overrides
├── .env.example            # Environment template
├── .dockerignore           # Docker ignore rules
├── nginx/                  # Nginx configuration
│   ├── nginx.conf
│   └── ssl/                # SSL certificates (production)
├── scripts/                # Deployment scripts
│   ├── deploy.sh
│   ├── backup.sh
│   └── restore.sh
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
└── monitoring/             # Monitoring stack
    ├── prometheus.yml
    └── grafana-dashboard.json
```

## 🐳 Container Details

### Application Container

- **Base Image**: `node:18-alpine`
- **Security**: Non-root user, minimal attack surface
- **Health Checks**: Built-in health endpoint monitoring
- **Multi-stage**: Build and runtime separation

### Services Stack

- **App**: Swaglex application (scalable)
- **Database**: PostgreSQL 15 with persistence
- **Cache**: Redis 7 for sessions and caching
- **Proxy**: Nginx for load balancing and SSL
- **Monitoring**: Prometheus + Grafana (optional)

## 🔧 Configuration

### Environment Variables

| Variable              | Description         | Default              |
| --------------------- | ------------------- | -------------------- |
| `NODE_ENV`            | Environment mode    | `production`         |
| `PORT`                | Application port    | `3000`               |
| `DB_HOST`             | Database hostname   | `postgres`           |
| `DB_NAME`             | Database name       | `swaglex_prod`       |
| `DB_USER`             | Database user       | `swaglex`            |
| `DB_PASS`             | Database password   | _(required)_         |
| `REDIS_URL`           | Redis connection    | `redis://redis:6379` |
| `JWT_SECRET`          | JWT signing key     | _(required)_         |
| `OAUTH_GOOGLE_ID`     | Google OAuth ID     | _(optional)_         |
| `OAUTH_GOOGLE_SECRET` | Google OAuth Secret | _(optional)_         |

### Docker Compose Services

```yaml
# Basic services
services:
  app: # Swaglex application
  postgres: # PostgreSQL database
  redis: # Redis cache
  nginx: # Load balancer/proxy

  # Optional monitoring
  prometheus: # Metrics collection
  grafana: # Metrics visualization
```

## 🚀 Deployment Options

### Development Deployment

```bash
# Start with hot-reload and debug logging
docker-compose -f docker-compose.yml up --build
```

### Production Deployment

```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s/
```

## 📊 Monitoring & Health Checks

### Built-in Health Endpoints

- `GET /health` - Application health status
- `GET /health/db` - Database connectivity
- `GET /health/cache` - Redis connectivity
- `GET /metrics` - Prometheus metrics

### Monitoring Stack

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Custom Dashboards**: API performance, database stats, error rates

## 🔒 Security Features

### Container Security

- Non-root user execution
- Read-only root filesystem
- Minimal base image (Alpine)
- Security scanning in CI/CD

### Network Security

- Internal networks for service communication
- Nginx proxy with security headers
- SSL/TLS termination
- Rate limiting and DDoS protection

### Application Security

- JWT authentication
- CSRF protection
- Input validation and sanitization
- Security middleware (Helmet.js)

## 💾 Data Persistence

### Database Persistence

```yaml
volumes:
  postgres_data: # PostgreSQL data persistence
  redis_data: # Redis data persistence
```

### Backup Strategy

```bash
# Automated backup script
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh backup-2023-12-01.sql
```

## 🔄 Scaling & Load Balancing

### Horizontal Scaling

```bash
# Scale application instances
docker-compose up -d --scale app=3
```

### Load Balancer Configuration

- Round-robin load balancing
- Health check-based routing
- Session persistence via Redis
- SSL termination

## 🛠️ Development Workflow

### Local Development

```bash
# Start development stack
docker-compose -f docker-compose.dev.yml up

# Run tests in container
docker-compose exec app npm test

# Access container shell
docker-compose exec app sh
```

### Debugging

```bash
# View application logs
docker-compose logs -f app

# View all service logs
docker-compose logs

# Debug specific service
docker-compose exec app node --inspect server.js
```

## 📋 Maintenance

### Updates

```bash
# Update application
docker-compose pull
docker-compose up -d --build

# Update specific service
docker-compose up -d --build app
```

### Database Migrations

```bash
# Run database migrations
docker-compose exec app npm run migrate

# Rollback migrations
docker-compose exec app npm run migrate:rollback
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check port usage
   docker-compose ps
   netstat -tulpn | grep :3000
   ```

2. **Database Connection Issues**

   ```bash
   # Check database logs
   docker-compose logs postgres

   # Test connection
   docker-compose exec app npm run db:test
   ```

3. **Memory Issues**

   ```bash
   # Monitor resource usage
   docker stats

   # Adjust memory limits in docker-compose.yml
   ```

### Performance Optimization

1. **Database Optimization**
   - Connection pooling configuration
   - Index optimization
   - Query performance monitoring

2. **Caching Strategy**
   - Redis cache configuration
   - Application-level caching
   - CDN integration

3. **Container Optimization**
   - Multi-stage builds
   - Image size reduction
   - Resource limit tuning

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Test with Docker environment
4. Submit a pull request

## 📄 License

This example is part of the Swaglex framework and is licensed under the MIT License.

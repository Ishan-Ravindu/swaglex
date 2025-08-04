# Advanced Features Example

This example demonstrates advanced Swaglex features for enterprise usage.

## Features Demonstrated

- JWT Authentication
- OAuth Integration (Google)
- Redis Caching
- PostgreSQL Database
- Rate Limiting
- Security Headers
- Multi-Document Support
- Custom Middleware
- Advanced Logging
- Health Checks

## Prerequisites

- PostgreSQL database
- Redis server
- Google OAuth credentials (optional)

## Setup

1. **Configure Environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your database and OAuth credentials
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Setup Database**:

   ```bash
   npm run setup
   ```

4. **Start Server**:
   ```bash
   npm start
   ```

## Configuration

This example shows production-ready configuration with:

- PostgreSQL for data persistence
- Redis for session storage and caching
- JWT tokens for API authentication
- Google OAuth for user authentication
- Comprehensive security middleware
- Advanced logging with file rotation

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/metrics` - System metrics
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /docs/users-api` - User management API docs
- `GET /docs/orders-api` - Order management API docs

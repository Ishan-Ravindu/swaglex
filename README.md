Swagger Documentation Framework (Under Development)

A comprehensive npm package for building and managing Swagger documentation with authentication, role-based access control, and multi-document support.

## Features

- 🔐 **Authentication & Authorization**: Session-based auth with role-based access control
- 📚 **Multi-Document Support**: Manage multiple API documentation files
- 👥 **User Management**: Complete admin panel for user administration
- 🗄️ **Database Support**: SQLite (default), MySQL, PostgreSQL, MariaDB
- 🛠️ **CLI Tools**: Easy project initialization and management
- 🎨 **Modern UI**: Responsive admin panel and login interface

## Quick Start

### Installation

```bash
npm install -g swagger-docs-framework
Create a New Project
bashswagger-docs init my-api-docs
cd my-api-docs
npm install
npm start
Default Login

Email: admin@swagger-docs.local
Password: admin123

Configuration
The framework supports multiple databases. SQLite is the default for zero-configuration setup.
Environment Variables
Create a .env file:
envNODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key

# Database Configuration
DB_DIALECT=sqlite
# DB_STORAGE=./data/swagger-docs.db
Database Options
SQLite (Default)
envDB_DIALECT=sqlite
DB_STORAGE=./data/swagger-docs.db
MySQL/MariaDB
envDB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=swagger_docs
DB_USER=root
DB_PASSWORD=password
PostgreSQL
envDB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swagger_docs
DB_USER=postgres
DB_PASSWORD=password
CLI Commands
Initialize Project
bashswagger-docs init [project-name]
Add API Documentation
bashswagger-docs add-doc <name>
Create Admin User
bashswagger-docs create-admin
API Endpoints
Authentication

POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/me - Current user info

Admin (Protected)

GET /api/admin/users - List all users
POST /api/admin/users - Create user
PUT /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user

Documentation

GET /docs - List all documentation
GET /docs/:name - View specific documentation

License
MIT

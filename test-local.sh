#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Main script
print_info "Setting up Swagger Docs Framework for local testing..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Clean up any previous links
npm unlink 2>/dev/null || true

# Install dependencies
print_info "Installing dependencies..."
if ! npm install; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Create global link
print_info "Creating npm link..."
if ! npm link; then
    print_error "Failed to create npm link"
    exit 1
fi

# Create test directory with timestamp
TIMESTAMP=$(date +%s)
TEST_DIR="../swagger-test-${TIMESTAMP}"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

print_info "Creating test project..."

# Initialize test project using the CLI
if ! swagger-docs init my-test-api; then
    print_error "Failed to initialize test project"
    exit 1
fi

cd my-test-api

# Link the package
print_info "Linking swagger-docs-framework..."
if ! npm link swagger-docs-framework; then
    print_error "Failed to link swagger-docs-framework"
    exit 1
fi

# Create some test API docs
print_info "Creating test API documentation files..."

cat > docs/users-api.yaml << 'YAML_EOF'
openapi: 3.0.0
info:
  title: Users API
  version: 1.0.0
  description: Test API for user management
servers:
  - url: http://localhost:3000/api
paths:
  /users:
    get:
      summary: List all users
      tags:
        - Users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    email:
                      type: string
YAML_EOF

cat > docs/products-api.yaml << 'YAML_EOF'
openapi: 3.0.0
info:
  title: Products API
  version: 1.0.0
  description: Test API for product management
servers:
  - url: http://localhost:3000/api
paths:
  /products:
    get:
      summary: List all products
      tags:
        - Products
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    name:
                      type: string
                    price:
                      type: number
YAML_EOF

# Generate session secret
if command -v openssl &> /dev/null; then
    SESSION_SECRET=$(openssl rand -hex 32)
else
    SESSION_SECRET="test-secret-key-${TIMESTAMP}"
fi

# Create .env file
print_info "Creating .env file..."
cat > .env << ENV_EOF
NODE_ENV=development
PORT=3000
SESSION_SECRET=${SESSION_SECRET}
DB_DIALECT=sqlite
DB_STORAGE=./data/test-swagger.db
ENV_EOF

# Create initial npm install
print_info "Installing project dependencies..."
npm install

print_success "✅ Test project created successfully!"
echo ""
print_success "Test project location: $TEST_DIR/my-test-api"
echo ""
print_info "To start testing:"
echo "  cd $TEST_DIR/my-test-api"
echo "  npm start"
echo ""
print_info "Then open: http://localhost:3000"
echo ""
print_success "Default admin credentials:"
echo "  Email: admin@swagger-docs.local"
echo "  Password: admin123"
echo ""
print_info "Additional test API docs created:"
echo "  - docs/users-api.yaml"
echo "  - docs/products-api.yaml"
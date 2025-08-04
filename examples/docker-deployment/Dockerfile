# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S swaglex -u 1001

# Production stage
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S swaglex -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=swaglex:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=swaglex:nodejs /app/package*.json ./
COPY --chown=swaglex:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R swaglex:nodejs /app/logs /app/uploads /app/temp

# Set proper permissions
RUN chmod -R 755 /app && \
    chmod -R 777 /app/logs /app/uploads /app/temp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node healthcheck.js || exit 1

# Security: Use non-root user
USER swaglex

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]

# Labels for metadata
LABEL maintainer="Swaglex Team <team@swaglex.io>" \
      version="1.0.0" \
      description="Swaglex API Documentation Framework" \
      org.opencontainers.image.title="Swaglex" \
      org.opencontainers.image.description="Production-ready Swagger documentation framework" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="Swaglex Team" \
      org.opencontainers.image.source="https://github.com/username/swaglex" \
      org.opencontainers.image.licenses="MIT"

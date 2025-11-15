const { SwaggerDocsFramework } = require('swaglex')
require('dotenv').config()

// Load configuration
const config = require('./swaglex.config')

// Create and start the server
const app = new SwaggerDocsFramework(config)

app.start().catch(error => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  app.stop()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  app.stop()
  process.exit(0)
})

const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const helmet = require('helmet')
const compression = require('compression')

class SecurityManager {
  constructor (config = {}) {
    this.config = config
  }

  // Rate limiting middleware
  rateLimiter () {
    if (!this.config.rateLimiting?.enabled) {
      return (req, res, next) => next()
    }

    return rateLimit({
      windowMs: this.config.rateLimiting.windowMs || 15 * 60 * 1000, // 15 minutes
      max: this.config.rateLimiting.maxRequests || 100,
      message: {
        error: this.config.rateLimiting.message || 'Too many requests, please try again later'
      },
      standardHeaders: this.config.rateLimiting.standardHeaders !== false,
      legacyHeaders: this.config.rateLimiting.legacyHeaders === true,
      handler: (req, res) => {
        res.status(429).json({
          error: this.config.rateLimiting.message || 'Too many requests, please try again later',
          retryAfter: Math.round(this.config.rateLimiting.windowMs / 1000)
        })
      }
    })
  }

  // Slow down middleware for additional protection
  slowDown () {
    if (!this.config.rateLimiting?.enabled) {
      return (req, res, next) => next()
    }

    return slowDown({
      windowMs: this.config.rateLimiting.windowMs || 15 * 60 * 1000,
      delayAfter: Math.floor((this.config.rateLimiting.maxRequests || 100) * 0.5),
      delayMs: 500
    })
  }

  // Helmet security headers
  helmet () {
    if (!this.config.helmet?.enabled) {
      return (req, res, next) => next()
    }

    return helmet({
      contentSecurityPolicy: this.config.helmet.contentSecurityPolicy || {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: this.config.helmet.crossOriginEmbedderPolicy || false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    })
  }

  // Compression middleware
  compression () {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      },
      level: 6,
      threshold: 1024
    })
  }

  // CSRF protection
  csrf () {
    if (!this.config.csrf?.enabled) {
      return (req, res, next) => next()
    }

    const csrf = require('csurf')
    return csrf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }
    })
  }

  // Input sanitization
  sanitizeInput () {
    return (req, res, next) => {
      // Basic XSS protection
      const sanitize = obj => {
        if (typeof obj === 'string') {
          return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        }
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            obj[key] = sanitize(obj[key])
          }
        }
        return obj
      }

      req.body = sanitize(req.body)
      req.query = sanitize(req.query)
      req.params = sanitize(req.params)

      next()
    }
  }

  // Request validation middleware
  validateRequest (schema) {
    return (req, res, next) => {
      const { error } = schema.validate({
        body: req.body,
        query: req.query,
        params: req.params
      })

      if (error) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        })
      }

      next()
    }
  }
}

module.exports = SecurityManager

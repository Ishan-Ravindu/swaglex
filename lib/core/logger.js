const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

class Logger {
  constructor (config = {}) {
    this.config = {
      level: config.level || 'info',
      format: config.format || 'simple',
      file: config.file || { enabled: false },
      ...config
    }

    this.logger = this.createLogger()
  }

  createLogger () {
    const formats = []

    // Add timestamp
    formats.push(winston.format.timestamp())

    // Add errors format for proper error logging
    formats.push(winston.format.errors({ stack: true }))

    // Choose format based on config
    if (this.config.format === 'json') {
      formats.push(winston.format.json())
    } else {
      formats.push(
        winston.format.printf(({ timestamp, level, message, stack }) => `${timestamp} [${level.toUpperCase()}]: ${stack || message}`)
      )
    }

    const transports = []

    // Console transport
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), ...formats)
      })
    )

    // File transport if enabled
    if (this.config.file.enabled) {
      transports.push(
        new DailyRotateFile({
          filename: this.config.file.filename || './logs/swaglex-%DATE%.log',
          datePattern: this.config.file.datePattern || 'YYYY-MM-DD',
          maxSize: this.config.file.maxsize || '20m',
          maxFiles: this.config.file.maxFiles || '14d',
          format: winston.format.combine(...formats)
        })
      )
    }

    return winston.createLogger({
      level: this.config.level,
      transports
    })
  }

  error (message, meta = {}) {
    this.logger.error(message, meta)
  }

  warn (message, meta = {}) {
    this.logger.warn(message, meta)
  }

  info (message, meta = {}) {
    this.logger.info(message, meta)
  }

  debug (message, meta = {}) {
    this.logger.debug(message, meta)
  }

  // Request logging middleware
  requestLogger () {
    return (req, res, next) => {
      const start = Date.now()

      res.on('finish', () => {
        const duration = Date.now() - start
        const { method, url, ip } = req
        const { statusCode } = res

        const level = statusCode >= 400 ? 'warn' : 'info'
        this.logger[level](`${method} ${url}`, {
          ip,
          statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent')
        })
      })

      next()
    }
  }
}

module.exports = Logger

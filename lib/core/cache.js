const NodeCache = require('node-cache')
const Redis = require('redis')

class CacheManager {
  constructor (config = {}) {
    this.config = {
      provider: config.provider || 'memory',
      ttl: config.ttl || 300, // 5 minutes default
      redis: config.redis || {},
      ...config
    }

    this.cache = null
    this.init()
  }

  async init () {
    if (this.config.provider === 'redis') {
      await this.initRedis()
    } else {
      this.initMemory()
    }
  }

  initMemory () {
    this.cache = new NodeCache({
      stdTTL: this.config.ttl,
      checkperiod: this.config.ttl * 0.2,
      useClones: false
    })
  }

  async initRedis () {
    try {
      this.cache = Redis.createClient({
        host: this.config.redis.host || 'localhost',
        port: this.config.redis.port || 6379,
        password: this.config.redis.password,
        db: this.config.redis.db || 0
      })

      await this.cache.connect()
      console.log('Connected to Redis cache')
    } catch (error) {
      console.warn('Failed to connect to Redis, falling back to memory cache:', error.message)
      this.initMemory()
    }
  }

  async get (key) {
    try {
      if (this.config.provider === 'redis' && this.cache.isReady) {
        const value = await this.cache.get(key)
        return value ? JSON.parse(value) : null
      } else {
        return this.cache.get(key)
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set (key, value, ttl = null) {
    try {
      const actualTtl = ttl || this.config.ttl

      if (this.config.provider === 'redis' && this.cache.isReady) {
        await this.cache.setEx(key, actualTtl, JSON.stringify(value))
      } else {
        this.cache.set(key, value, actualTtl)
      }

      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del (key) {
    try {
      if (this.config.provider === 'redis' && this.cache.isReady) {
        await this.cache.del(key)
      } else {
        this.cache.del(key)
      }

      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async clear () {
    try {
      if (this.config.provider === 'redis' && this.cache.isReady) {
        await this.cache.flushDb()
      } else {
        this.cache.flushAll()
      }

      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }

  // Middleware for caching responses
  middleware (ttl = null) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next()
      }

      const key = `route:${req.originalUrl}`
      const cached = await this.get(key)

      if (cached) {
        return res.json(cached)
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res)
      res.json = data => {
        this.set(key, data, ttl)
        return originalJson(data)
      }

      next()
    }
  }
}

module.exports = CacheManager

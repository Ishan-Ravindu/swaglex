const SwaggerDocsFramework = require('./lib/core/server')
const auth = require('./lib/core/auth')
const config = require('./lib/core/config')
const Logger = require('./lib/core/logger')
const CacheManager = require('./lib/core/cache')
const SecurityManager = require('./lib/core/security')

module.exports = {
  SwaggerDocsFramework,
  auth,
  config,
  Logger,
  CacheManager,
  SecurityManager,
  middleware: {
    authenticate: require('./lib/middleware/authentication'),
    authorize: require('./lib/middleware/authorization')
  },
  models: {
    User: require('./lib/models/User'),
    Document: require('./lib/models/Document')
  }
}

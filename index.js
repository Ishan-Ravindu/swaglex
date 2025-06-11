const SwaggerDocsFramework = require('./lib/core/server');
const auth = require('./lib/core/auth');
const config = require('./lib/core/config');

module.exports = {
  SwaggerDocsFramework,
  auth,
  config,
  middleware: {
    authenticate: require('./lib/middleware/authentication'),
    authorize: require('./lib/middleware/authorization')
  }
};
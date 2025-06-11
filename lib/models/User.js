const { getModels } = require('../core/database');

// This is a proxy module that exports the User model
// The actual model is defined in database.js to ensure proper initialization
module.exports = new Proxy({}, {
  get(target, prop) {
    const models = getModels();
    if (!models.User) {
      throw new Error('User model not initialized. Make sure database is initialized first.');
    }
    return models.User[prop];
  }
});
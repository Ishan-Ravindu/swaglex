const { getModels } = require('../core/database');

// This is a proxy module that exports the Document model
// The actual model is defined in database.js to ensure proper initialization
module.exports = new Proxy({}, {
  get(target, prop) {
    const models = getModels();
    if (!models.Document) {
      throw new Error('Document model not initialized. Make sure database is initialized first.');
    }
    return models.Document[prop];
  }
});
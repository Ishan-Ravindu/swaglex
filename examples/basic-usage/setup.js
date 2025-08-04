const { SwaggerDocsFramework } = require('swaglex');

async function setup() {
  try {
    console.log('🔧 Setting up Swaglex Basic Example...');

    // Configuration (same as in server.js)
    const config = {
      database: {
        dialect: 'sqlite',
        storage: './data/swaglex.db'
      }
    };

    // Initialize database
    const { initDB } = require('swaglex/lib/core/database');
    await initDB(config.database);

    console.log('✅ Database setup completed!');
    console.log('🚀 Run "npm start" to start the server');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();

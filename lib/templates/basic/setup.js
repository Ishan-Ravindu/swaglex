const { initDB } = require('swaglex/lib/core/database')
const config = require('./swaglex.config')

async function setup () {
  try {
    console.log('🗃️  Setting up database...')
    await initDB(config.database)

    console.log('✅ Setup completed successfully!')
    console.log('🚀 Run "npm start" to start the server')
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setup()

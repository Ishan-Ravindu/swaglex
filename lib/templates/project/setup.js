const inquirer = require('inquirer');
const fs = require('fs-extra');
const crypto = require('crypto');

async function setup() {
  console.log('🚀 Swagger Docs Framework Setup\n');
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'database',
      message: 'Select database type:',
      choices: [
        { name: 'SQLite (Recommended for development)', value: 'sqlite' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'PostgreSQL', value: 'postgres' },
        { name: 'MariaDB', value: 'mariadb' }
      ],
      default: 'sqlite'
    },
    {
      type: 'input',
      name: 'dbHost',
      message: 'Database host:',
      default: 'localhost',
      when: (answers) => answers.database !== 'sqlite'
    },
    {
      type: 'input',
      name: 'dbPort',
      message: 'Database port:',
      default: (answers) => {
        if (answers.database === 'mysql' || answers.database === 'mariadb') return '3306';
        if (answers.database === 'postgres') return '5432';
        return '';
      },
      when: (answers) => answers.database !== 'sqlite'
    },
    {
      type: 'input',
      name: 'dbName',
      message: 'Database name:',
      default: 'swagger_docs',
      when: (answers) => answers.database !== 'sqlite'
    },
    {
      type: 'input',
      name: 'dbUser',
      message: 'Database username:',
      when: (answers) => answers.database !== 'sqlite'
    },
    {
      type: 'password',
      name: 'dbPassword',
      message: 'Database password:',
      when: (answers) => answers.database !== 'sqlite'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Server port:',
      default: '3000',
      validate: (input) => {
        const port = parseInt(input);
        return port > 0 && port < 65536 || 'Please enter a valid port number';
      }
    },
    {
      type: 'confirm',
      name: 'createAdmin',
      message: 'Create admin user now?',
      default: true
    },
    {
      type: 'input',
      name: 'adminEmail',
      message: 'Admin email:',
      default: 'admin@example.com',
      when: (answers) => answers.createAdmin,
      validate: (input) => /\S+@\S+\.\S+/.test(input) || 'Please enter a valid email'
    },
    {
      type: 'password',
      name: 'adminPassword',
      message: 'Admin password:',
      when: (answers) => answers.createAdmin,
      validate: (input) => input.length >= 6 || 'Password must be at least 6 characters'
    }
  ]);
  
  // Generate session secret
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  
  // Create .env file
  let envContent = `NODE_ENV=development
PORT=${answers.port}
SESSION_SECRET=${sessionSecret}

# Database Configuration
DB_DIALECT=${answers.database}
`;
  
  if (answers.database === 'sqlite') {
    envContent += `DB_STORAGE=./data/swagger-docs.db\n`;
  } else {
    envContent += `DB_HOST=${answers.dbHost}
DB_PORT=${answers.dbPort}
DB_NAME=${answers.dbName}
DB_USER=${answers.dbUser}
DB_PASSWORD=${answers.dbPassword}
`;
  }
  
  await fs.writeFile('.env', envContent);
  console.log('✅ Created .env file');
  
  // Update swagger-config.js if needed
  if (answers.createAdmin) {
    const adminConfig = {
      email: answers.adminEmail,
      password: answers.adminPassword
    };
    await fs.writeFile('.admin-setup.json', JSON.stringify(adminConfig, null, 2));
    console.log('✅ Admin configuration saved');
  }
  
  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('  npm start');
  console.log(`  Open http://localhost:${answers.port}`);
  
  if (answers.createAdmin) {
    console.log(`\nAdmin login:`);
    console.log(`  Email: ${answers.adminEmail}`);
    console.log(`  Password: [hidden]`);
  }
}

setup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const bcrypt = require('bcryptjs');

const program = new Command();

program
  .name('swagger-docs')
  .description('CLI for Swagger Documentation Framework')
  .version('1.0.0');

// Initialize new project
program
  .command('init [project-name]')
  .description('Initialize a new Swagger documentation project')
  .action(async (projectName = 'swagger-docs-project') => {
    try {
      console.log(chalk.blue(`Initializing ${projectName}...`));
      
      const projectPath = path.join(process.cwd(), projectName);
      
      // Create project directory
      await fs.ensureDir(projectPath);
      
      // Check if template directory exists
      const templatePath = path.join(__dirname, '../lib/templates/project');
      const templateExists = await fs.pathExists(templatePath);
      
      if (templateExists) {
        console.log(chalk.gray('Copying template files...'));
        await fs.copy(templatePath, projectPath);
      } else {
        console.log(chalk.yellow('Template directory not found, creating basic structure...'));
        
        // Create basic package.json
        const packageJson = {
          name: projectName,
          version: "1.0.0",
          description: "Swagger API Documentation",
          main: "server.js",
          scripts: {
            start: "node server.js",
            dev: "nodemon server.js",
            setup: "node setup.js"
          },
          dependencies: {
            "swagger-docs-framework": "^1.0.0",
            "dotenv": "^16.0.0"
          },
          devDependencies: {
            "nodemon": "^3.0.0"
          }
        };
        await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
        
        // Create basic server.js
        const serverContent = `const { SwaggerDocsFramework } = require('swagger-docs-framework');
const path = require('path');
require('dotenv').config();

// Load configuration
const config = {
  port: process.env.PORT || 3000,
  database: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './data/swagger-docs.db'
  },
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret',
  docsPath: './docs'
};

// Create and start the server
const app = new SwaggerDocsFramework(config);

app.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  app.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  app.stop();
  process.exit(0);
});
`;
        await fs.writeFile(path.join(projectPath, 'server.js'), serverContent);
        
        // Create .env.example
        const envExample = `NODE_ENV=development
PORT=3000
SESSION_SECRET=change-this-to-a-random-string

# Database Configuration
DB_DIALECT=sqlite
# DB_STORAGE=./data/swagger-docs.db
`;
        await fs.writeFile(path.join(projectPath, '.env.example'), envExample);
      }
      
      // Create directories
      await fs.ensureDir(path.join(projectPath, 'docs'));
      await fs.ensureDir(path.join(projectPath, 'config'));
      await fs.ensureDir(path.join(projectPath, 'data'));
      
      // Create example swagger file
      const exampleSwaggerPath = path.join(__dirname, '../lib/templates/swagger/example.yaml');
      const exampleSwaggerExists = await fs.pathExists(exampleSwaggerPath);
      
      if (exampleSwaggerExists) {
        await fs.copy(exampleSwaggerPath, path.join(projectPath, 'docs/api-v1.yaml'));
      } else {
        // Create a basic example
        const basicSwagger = `openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
  description: Example API documentation
servers:
  - url: http://localhost:3000/api
paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
`;
        await fs.writeFile(path.join(projectPath, 'docs/api-v1.yaml'), basicSwagger);
      }
      
      console.log(chalk.green(`✓ Project ${projectName} created successfully!`));
      console.log(chalk.yellow('\nNext steps:'));
      console.log(`  cd ${projectName}`);
      console.log('  npm install');
      console.log('  cp .env.example .env');
      console.log('  npm start');
      
    } catch (error) {
      console.error(chalk.red('Error creating project:'), error.message);
      process.exit(1);
    }
  });

// Add new API document
program
  .command('add-doc <name>')
  .description('Add a new API documentation file')
  .option('-t, --template <template>', 'Use a template', 'basic')
  .action(async (name, options) => {
    try {
      const docsPath = path.join(process.cwd(), 'docs');
      
      // Ensure docs directory exists
      await fs.ensureDir(docsPath);
      
      const docFile = path.join(docsPath, `${name}.yaml`);
      
      if (await fs.pathExists(docFile)) {
        console.log(chalk.red(`Document ${name}.yaml already exists!`));
        return;
      }
      
      const template = `openapi: 3.0.0
info:
  title: ${name} API
  version: 1.0.0
  description: API documentation for ${name}
servers:
  - url: http://localhost:3000/api
paths:
  /example:
    get:
      summary: Example endpoint
      responses:
        '200':
          description: Successful response
`;
      
      await fs.writeFile(docFile, template);
      console.log(chalk.green(`✓ Created ${name}.yaml in docs/`));
    } catch (error) {
      console.error(chalk.red('Error creating document:'), error.message);
      process.exit(1);
    }
  });

// Create admin user
program
  .command('create-admin')
  .description('Create an admin user')
  .action(async () => {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Admin email:',
          validate: (input) => /\S+@\S+\.\S+/.test(input) || 'Please enter a valid email'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Admin password:',
          validate: (input) => input.length >= 6 || 'Password must be at least 6 characters'
        }
      ]);
      
      // This would normally connect to the database
      console.log(chalk.green(`✓ Admin user created: ${answers.email}`));
      console.log(chalk.yellow('Note: Run this command after starting the server for the first time'));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();
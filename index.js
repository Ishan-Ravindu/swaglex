#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const Table = require('cli-table3');
const express = require('express');
const open = require('open');
const chokidar = require('chokidar');
const cors = require('cors');

// Configuration
const CONFIG_FILE = '.swaggerhub.json';
const DEFAULT_PORT = 3000;
const HOMEPAGE_PORT = 3001;

// Helper functions
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg)
};

// Load/Save configuration
const loadConfig = async () => {
  try {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
  } catch (error) {
    log.warning('No config file found, creating new one...');
  }
  return {
    apis: [],
    port: DEFAULT_PORT,
    theme: 'default'
  };
};

const saveConfig = async (config) => {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
};

const getGlobalConfig = async () => {
  const homeDir = require('os').homedir();
  const globalConfigPath = path.join(homeDir, '.swaggerhub', 'config.json');
  
  try {
    if (await fs.pathExists(globalConfigPath)) {
      return await fs.readJson(globalConfigPath);
    }
  } catch (error) {
    // Ignore error
  }
  
  return { projects: [] };
};

const saveGlobalConfig = async (config) => {
  const homeDir = require('os').homedir();
  const globalConfigDir = path.join(homeDir, '.swaggerhub');
  const globalConfigPath = path.join(globalConfigDir, 'config.json');
  
  await fs.ensureDir(globalConfigDir);
  await fs.writeJson(globalConfigPath, config, { spaces: 2 });
};

// Parse swagger file
const parseSwaggerFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let spec;
    
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      spec = yaml.load(content);
    } else if (filePath.endsWith('.json')) {
      spec = JSON.parse(content);
    } else {
      throw new Error('Unsupported file format. Use .yaml, .yml, or .json');
    }
    
    return spec;
  } catch (error) {
    throw new Error(`Failed to parse swagger file: ${error.message}`);
  }
};

// Commands
const init = async () => {
  log.info('Initializing SwaggerHub configuration...');
  
  const config = await loadConfig();
  
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: path.basename(process.cwd())
    },
    {
      type: 'input',
      name: 'port',
      message: 'Default port for API documentation:',
      default: config.port || DEFAULT_PORT,
      validate: (input) => {
        const port = parseInt(input);
        return port > 0 && port < 65536 ? true : 'Please enter a valid port number';
      }
    },
    {
      type: 'list',
      name: 'theme',
      message: 'UI theme:',
      choices: ['default', 'dark', 'material', 'feeling-blue'],
      default: config.theme || 'default'
    }
  ]);
  
  config.projectName = answers.projectName;
  config.port = parseInt(answers.port);
  config.theme = answers.theme;
  
  await saveConfig(config);
  
  // Add to global projects
  const globalConfig = await getGlobalConfig();
  const projectPath = process.cwd();
  
  if (!globalConfig.projects.find(p => p.path === projectPath)) {
    globalConfig.projects.push({
      name: answers.projectName,
      path: projectPath,
      config: CONFIG_FILE
    });
    await saveGlobalConfig(globalConfig);
  }
  
  log.success('SwaggerHub initialized successfully!');
};

const add = async (swaggerFile, options) => {
  const config = await loadConfig();
  
  if (!swaggerFile) {
    // Interactive mode - find swagger files
    const files = await findSwaggerFiles();
    
    if (files.length === 0) {
      log.error('No swagger files found in the current directory');
      return;
    }
    
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'file',
        message: 'Select swagger file to add:',
        choices: files
      }
    ]);
    
    swaggerFile = answer.file;
  }
  
  const absolutePath = path.resolve(swaggerFile);
  
  if (!await fs.pathExists(absolutePath)) {
    log.error(`File not found: ${swaggerFile}`);
    return;
  }
  
  try {
    const spec = await parseSwaggerFile(absolutePath);
    
    const apiInfo = {
      id: options.id || generateId(spec.info.title || path.basename(swaggerFile)),
      file: swaggerFile,
      absolutePath: absolutePath,
      title: spec.info.title || 'Untitled API',
      version: spec.info.version || '1.0.0',
      description: spec.info.description || '',
      port: options.port || config.port + config.apis.length + 1
    };
    
    // Check if already exists
    if (config.apis.find(api => api.absolutePath === absolutePath)) {
      log.warning('This swagger file is already added');
      return;
    }
    
    config.apis.push(apiInfo);
    await saveConfig(config);
    
    log.success(`Added: ${apiInfo.title} (${apiInfo.file})`);
    log.info(`Assigned port: ${apiInfo.port}`);
  } catch (error) {
    log.error(error.message);
  }
};

const list = async () => {
  const config = await loadConfig();
  
  if (config.apis.length === 0) {
    log.info('No APIs registered. Use "swaggerhub add <file>" to add swagger files');
    return;
  }
  
  const table = new Table({
    head: ['ID', 'Title', 'Version', 'Port', 'File'],
    colWidths: [15, 30, 10, 8, 40]
  });
  
  for (const api of config.apis) {
    const exists = await fs.pathExists(api.absolutePath);
    table.push([
      api.id,
      api.title,
      api.version,
      api.port,
      exists ? api.file : chalk.red(api.file + ' (missing)')
    ]);
  }
  
  console.log('\nRegistered APIs:');
  console.log(table.toString());
};

const remove = async (apiId) => {
  const config = await loadConfig();
  
  if (!apiId) {
    if (config.apis.length === 0) {
      log.info('No APIs to remove');
      return;
    }
    
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'api',
        message: 'Select API to remove:',
        choices: config.apis.map(api => ({
          name: `${api.title} (${api.id})`,
          value: api.id
        }))
      }
    ]);
    
    apiId = answer.api;
  }
  
  const index = config.apis.findIndex(api => api.id === apiId);
  
  if (index === -1) {
    log.error(`API not found: ${apiId}`);
    return;
  }
  
  const removed = config.apis.splice(index, 1)[0];
  await saveConfig(config);
  
  log.success(`Removed: ${removed.title}`);
};

const serve = async (apiId, options) => {
  const config = await loadConfig();
  
  if (config.apis.length === 0) {
    log.error('No APIs registered. Use "swaggerhub add <file>" first');
    return;
  }
  
  let api;
  
  if (!apiId) {
    if (config.apis.length === 1) {
      api = config.apis[0];
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'api',
          message: 'Select API to serve:',
          choices: config.apis.map(a => ({
            name: `${a.title} (${a.id})`,
            value: a
          }))
        }
      ]);
      api = answer.api;
    }
  } else {
    api = config.apis.find(a => a.id === apiId);
    if (!api) {
      log.error(`API not found: ${apiId}`);
      return;
    }
  }
  
  const port = options.port || api.port;
  
  log.info(`Starting Swagger UI for ${api.title} on port ${port}...`);
  
  const app = express();
  app.use(cors());
  
  // Serve swagger-ui assets
  app.use('/swagger-ui', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));
  
  // Serve the swagger file
  app.get('/swagger.json', async (req, res) => {
    try {
      const spec = await parseSwaggerFile(api.absolutePath);
      res.json(spec);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Serve the UI
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>${api.title}</title>
        <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/swagger-ui/swagger-ui-bundle.js"></script>
        <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: "/swagger.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
      </html>
    `);
  });
  
  app.listen(port, () => {
    log.success(`Swagger UI running at http://localhost:${port}`);
    if (options.open) {
      open(`http://localhost:${port}`);
    }
  });
  
  // Watch for changes if requested
  if (options.watch) {
    const watcher = chokidar.watch(api.absolutePath);
    watcher.on('change', () => {
      log.info('Swagger file changed, reload the browser to see updates');
    });
  }
};

const home = async (options) => {
  const config = await loadConfig();
  const port = options.port || HOMEPAGE_PORT;
  
  log.info(`Starting SwaggerHub home page on port ${port}...`);
  
  const app = express();
  app.use(cors());
  
  // API endpoint to get all APIs
  app.get('/api/list', async (req, res) => {
    const apis = [];
    
    for (const api of config.apis) {
      const exists = await fs.pathExists(api.absolutePath);
      apis.push({
        ...api,
        exists,
        url: `http://localhost:${api.port}`
      });
    }
    
    res.json({
      projectName: config.projectName || 'SwaggerHub',
      apis
    });
  });
  
  // Start individual API servers
  for (const api of config.apis) {
    if (await fs.pathExists(api.absolutePath)) {
      startApiServer(api);
    }
  }
  
  // Serve home page
  app.get('/', (req, res) => {
    res.send(getHomepageHTML());
  });
  
  app.listen(port, () => {
    log.success(`SwaggerHub home page running at http://localhost:${port}`);
    if (options.open !== false) {
      open(`http://localhost:${port}`);
    }
  });
};

const validate = async (apiId) => {
  const config = await loadConfig();
  
  let apisToValidate = [];
  
  if (apiId) {
    const api = config.apis.find(a => a.id === apiId);
    if (!api) {
      log.error(`API not found: ${apiId}`);
      return;
    }
    apisToValidate = [api];
  } else {
    apisToValidate = config.apis;
  }
  
  const table = new Table({
    head: ['API', 'Status', 'Issues'],
    colWidths: [30, 15, 50]
  });
  
  for (const api of apisToValidate) {
    try {
      if (!await fs.pathExists(api.absolutePath)) {
        table.push([api.title, chalk.red('Missing'), 'File not found']);
        continue;
      }
      
      const spec = await parseSwaggerFile(api.absolutePath);
      const issues = validateSwaggerSpec(spec);
      
      if (issues.length === 0) {
        table.push([api.title, chalk.green('Valid'), 'No issues found']);
      } else {
        table.push([api.title, chalk.yellow('Warning'), issues.join(', ')]);
      }
    } catch (error) {
      table.push([api.title, chalk.red('Error'), error.message]);
    }
  }
  
  console.log('\nValidation Results:');
  console.log(table.toString());
};

const bundle = async (apiId, output) => {
  const config = await loadConfig();
  
  const api = config.apis.find(a => a.id === apiId);
  if (!api) {
    log.error(`API not found: ${apiId}`);
    return;
  }
  
  try {
    const spec = await parseSwaggerFile(api.absolutePath);
    const outputPath = output || `${api.id}-bundled.json`;
    
    await fs.writeJson(outputPath, spec, { spaces: 2 });
    log.success(`Bundled API saved to: ${outputPath}`);
  } catch (error) {
    log.error(`Failed to bundle API: ${error.message}`);
  }
};

// Helper functions
const findSwaggerFiles = async (dir = '.') => {
  const files = [];
  const patterns = ['**/*.swagger.json', '**/*.swagger.yaml', '**/*.swagger.yml', '**/swagger.json', '**/swagger.yaml', '**/openapi.json', '**/openapi.yaml'];
  
  const { glob } = require('glob');
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, { 
      cwd: dir, 
      ignore: ['node_modules/**', 'dist/**', 'build/**'] 
    });
    files.push(...matches);
  }
  
  return [...new Set(files)];
};

const generateId = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

const validateSwaggerSpec = (spec) => {
  const issues = [];
  
  if (!spec.info) issues.push('Missing info object');
  if (!spec.paths || Object.keys(spec.paths).length === 0) issues.push('No paths defined');
  
  if (spec.openapi) {
    if (!spec.openapi.startsWith('3.')) issues.push('Invalid OpenAPI version');
  } else if (spec.swagger) {
    if (spec.swagger !== '2.0') issues.push('Invalid Swagger version');
  } else {
    issues.push('Missing version field (openapi or swagger)');
  }
  
  return issues;
};

const startApiServer = (api) => {
  const app = express();
  app.use(cors());
  
  app.use('/swagger-ui', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));
  
  app.get('/swagger.json', async (req, res) => {
    try {
      const spec = await parseSwaggerFile(api.absolutePath);
      res.json(spec);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>${api.title}</title>
        <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/swagger-ui/swagger-ui-bundle.js"></script>
        <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: "/swagger.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
          };
        </script>
      </body>
      </html>
    `);
  });
  
  app.listen(api.port, () => {
    log.info(`${api.title} running at http://localhost:${api.port}`);
  });
};

const getHomepageHTML = () => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SwaggerHub - API Documentation Portal</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #f5f7fa;
          color: #333;
          line-height: 1.6;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          opacity: 0.9;
          font-size: 1.1rem;
        }
        .stats {
          display: flex;
          gap: 2rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .stat {
          background: rgba(255,255,255,0.1);
          padding: 0.5rem 1.5rem;
          border-radius: 2rem;
          backdrop-filter: blur(10px);
        }
        .api-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
          padding-bottom: 2rem;
        }
        .api-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .api-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .api-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .api-card:hover::before {
          transform: scaleX(1);
        }
        .api-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2d3748;
        }
        .api-version {
          display: inline-block;
          background: #e6fffa;
          color: #234e52;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }
        .api-description {
          color: #718096;
          font-size: 0.95rem;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .api-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #a0aec0;
        }
        .api-port {
          background: #f7fafc;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-family: monospace;
        }
        .api-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #48bb78;
        }
        .status-dot.offline {
          background: #f56565;
        }
        .loading {
          text-align: center;
          padding: 4rem;
          color: #718096;
        }
        .empty {
          text-align: center;
          padding: 4rem;
          color: #718096;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.3;
        }
        .search-box {
          margin: 2rem 0;
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .no-results {
          text-align: center;
          padding: 3rem;
          color: #718096;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="container">
          <h1 id="project-name">SwaggerHub</h1>
          <p class="subtitle">API Documentation Portal</p>
          <div class="stats">
            <div class="stat">
              <span id="api-count">0</span> APIs
            </div>
            <div class="stat">
              <span id="online-count">0</span> Online
            </div>
          </div>
        </div>
      </div>
      
      <div class="container">
        <div class="search-box">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search APIs by name or description..."
            id="search-input"
          />
        </div>
        
        <div id="content">
          <div class="loading">
            <p>Loading APIs...</p>
          </div>
        </div>
      </div>
      
      <script>
        let allApis = [];
        
        async function loadAPIs() {
          try {
            const response = await fetch('/api/list');
            const data = await response.json();
            
            document.getElementById('project-name').textContent = data.projectName || 'SwaggerHub';
            document.getElementById('api-count').textContent = data.apis.length;
            
            allApis = data.apis;
            renderAPIs(allApis);
            
            // Check online status
            checkOnlineStatus(data.apis);
          } catch (error) {
            document.getElementById('content').innerHTML = '<div class="empty"><p>Failed to load APIs</p></div>';
          }
        }
        
        function renderAPIs(apis) {
          const content = document.getElementById('content');
          
          if (apis.length === 0) {
            content.innerHTML = \`
              <div class="empty">
                <div class="empty-icon">📋</div>
                <h2>No APIs Found</h2>
                <p>Use the CLI to add swagger files: <code>swaggerhub add [file]</code></p>
              </div>
            \`;
            return;
          }
          
          const grid = apis.map(api => \`
            <div class="api-card" onclick="openAPI('\${api.url}')">
              <h3 class="api-title">\${api.title}</h3>
              <span class="api-version">v\${api.version}</span>
              <p class="api-description">\${api.description || 'No description available'}</p>
              <div class="api-meta">
                <span class="api-port">Port: \${api.port}</span>
                <div class="api-status">
                  <span class="status-dot \${api.exists ? '' : 'offline'}" id="status-\${api.id}"></span>
                  <span>\${api.exists ? 'Available' : 'Missing'}</span>
                </div>
              </div>
            </div>
          \`).join('');
          
          content.innerHTML = '<div class="api-grid">' + grid + '</div>';
        }
        
        async function checkOnlineStatus(apis) {
          let onlineCount = 0;
          
          for (const api of apis) {
            if (api.exists) {
              try {
                const response = await fetch(api.url, { mode: 'no-cors' });
                document.getElementById(\`status-\${api.id}\`).classList.remove('offline');
                onlineCount++;
              } catch (error) {
                document.getElementById(\`status-\${api.id}\`).classList.add('offline');
              }
            }
          }
          
          document.getElementById('online-count').textContent = onlineCount;
        }
        
        function openAPI(url) {
          window.open(url, '_blank');
        }
        
        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
          const searchTerm = e.target.value.toLowerCase();
          
          if (!searchTerm) {
            renderAPIs(allApis);
            return;
          }
          
          const filtered = allApis.filter(api => 
            api.title.toLowerCase().includes(searchTerm) ||
            (api.description && api.description.toLowerCase().includes(searchTerm)) ||
            api.id.toLowerCase().includes(searchTerm)
          );
          
          if (filtered.length === 0) {
            document.getElementById('content').innerHTML = \`
              <div class="no-results">
                <p>No APIs found matching "\${e.target.value}"</p>
              </div>
            \`;
          } else {
            renderAPIs(filtered);
          }
        });
        
        // Load APIs on page load
        loadAPIs();
        
        // Refresh every 30 seconds
        setInterval(loadAPIs, 30000);
      </script>
    </body>
    </html>
  `;
};

// CLI Setup
program
  .name('swaggerhub')
  .description('General purpose Swagger documentation management tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize SwaggerHub in current directory')
  .action(init);

program
  .command('add [file]')
  .description('Add a swagger file to the hub')
  .option('-i, --id <id>', 'Custom ID for the API')
  .option('-p, --port <port>', 'Custom port for this API')
  .action(add);

program
  .command('list')
  .alias('ls')
  .description('List all registered APIs')
  .action(list);

program
  .command('remove [id]')
  .alias('rm')
  .description('Remove an API from the hub')
  .action(remove);

program
  .command('serve [id]')
  .description('Serve a specific API documentation')
  .option('-p, --port <port>', 'Override default port')
  .option('-w, --watch', 'Watch for file changes')
  .option('-o, --open', 'Open in browser')
  .action(serve);

program
  .command('home')
  .description('Start the SwaggerHub home page with all APIs')
  .option('-p, --port <port>', 'Port for home page', HOMEPAGE_PORT)
  .option('--no-open', 'Do not open browser')
  .action(home);

program
  .command('validate [id]')
  .description('Validate swagger specifications')
  .action(validate);

program
  .command('bundle <id> [output]')
  .description('Bundle a swagger file with all references')
  .action(bundle);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
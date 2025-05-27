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

module.exports = { getHomepageHTML };

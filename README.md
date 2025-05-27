# SwaggerHub CLI (UNDER DEVELOPMENT)

A powerful command-line tool for managing and serving Swagger/OpenAPI documentation with a beautiful web portal interface.

![npm version](https://img.shields.io/npm/v/swaggerhub-tool.svg)
![node version](https://img.shields.io/node/v/swaggerhub-tool.svg)
![license](https://img.shields.io/npm/l/swaggerhub-tool.svg)

## Features

- 🚀 **Easy Setup** - Initialize and configure in seconds
- 📋 **Multi-API Management** - Manage multiple Swagger/OpenAPI files in one project
- 🌐 **Beautiful Web Portal** - Modern, searchable homepage for all your APIs
- 🔍 **Auto-Discovery** - Automatically finds Swagger files in your project
- 🎨 **Swagger UI Integration** - Full-featured Swagger UI for each API
- 🔄 **Live Reload** - Watch mode for development
- ✅ **Validation** - Built-in OpenAPI/Swagger specification validation
- 📦 **Bundle Support** - Bundle specifications with all references

## Installation

### Global Installation (Recommended)

```bash
npm install -g swaggerhub-tool
```

### Local Installation

```bash
npm install swaggerhub-tool
```

### From Source

```bash
git clone https://github.com/Ishan-Ravindu/swaggerhub-tool.git
cd swaggerhub-tool
npm install
npm link
```

Or use the installation script:

```bash
./install.sh
```

## Quick Start

1. **Initialize SwaggerHub in your project:**
   ```bash
   swaggerhub init
   ```

2. **Add your API documentation:**
   ```bash
   # Interactive mode - automatically finds swagger files
   swaggerhub add
   
   # Or specify a file directly
   swaggerhub add ./api/swagger.yaml
   ```

3. **Start the web portal:**
   ```bash
   swaggerhub home
   ```

4. **Access your APIs:**
   - Portal: http://localhost:3001
   - Individual APIs: http://localhost:3000, 3001, 3002...

## Commands

### `swaggerhub init`
Initialize SwaggerHub configuration in the current directory.

```bash
swaggerhub init
```

**Options:**
- Prompts for project name, default port, and UI theme

### `swaggerhub add [file]`
Add a Swagger/OpenAPI file to the hub.

```bash
# Interactive mode
swaggerhub add

# Specify file
swaggerhub add ./swagger.yaml

# With options
swaggerhub add ./swagger.yaml --id my-api --port 3005
```

**Options:**
- `-i, --id <id>` - Custom ID for the API
- `-p, --port <port>` - Custom port for this API

### `swaggerhub list`
List all registered APIs.

```bash
swaggerhub list
# or
swaggerhub ls
```

### `swaggerhub remove [id]`
Remove an API from the hub.

```bash
# Interactive mode
swaggerhub remove

# Specify API ID
swaggerhub remove my-api
```

### `swaggerhub serve [id]`
Serve a specific API documentation.

```bash
# Interactive mode (if multiple APIs)
swaggerhub serve

# Specify API ID
swaggerhub serve my-api

# With options
swaggerhub serve my-api --port 4000 --watch --open
```

**Options:**
- `-p, --port <port>` - Override default port
- `-w, --watch` - Watch for file changes
- `-o, --open` - Open in browser

### `swaggerhub home`
Start the SwaggerHub home page with all APIs.

```bash
swaggerhub home

# Custom port
swaggerhub home --port 8080

# Without auto-opening browser
swaggerhub home --no-open
```

**Options:**
- `-p, --port <port>` - Port for home page (default: 3001)
- `--no-open` - Don't open browser automatically

### `swaggerhub validate [id]`
Validate Swagger/OpenAPI specifications.

```bash
# Validate all APIs
swaggerhub validate

# Validate specific API
swaggerhub validate my-api
```

### `swaggerhub bundle <id> [output]`
Bundle a swagger file with all references.

```bash
# Bundle with default output name
swaggerhub bundle my-api

# Specify output file
swaggerhub bundle my-api ./bundled-api.json
```

## Configuration

SwaggerHub creates a `.swaggerhub.json` configuration file in your project:

```json
{
  "projectName": "My API Project",
  "port": 3000,
  "theme": "default",
  "apis": [
    {
      "id": "user-api",
      "file": "./apis/user.swagger.yaml",
      "absolutePath": "/path/to/apis/user.swagger.yaml",
      "title": "User Management API",
      "version": "1.0.0",
      "description": "API for user management operations",
      "port": 3001
    }
  ]
}
```

## File Detection

SwaggerHub automatically detects files matching these patterns:
- `**/*.swagger.json`
- `**/*.swagger.yaml`
- `**/*.swagger.yml`
- `**/swagger.json`
- `**/swagger.yaml`
- `**/openapi.json`
- `**/openapi.yaml`

Excluded directories: `node_modules/`, `dist/`, `build/`

## Web Portal Features

The SwaggerHub home page provides:

- 📊 **API Overview** - See all your APIs at a glance
- 🔍 **Search** - Quick search by name, description, or ID
- 🟢 **Status Monitoring** - Real-time online/offline status
- 🎨 **Modern UI** - Beautiful, responsive design
- ⚡ **Quick Access** - One-click to open any API documentation

## API Structure Support

SwaggerHub supports both Swagger 2.0 and OpenAPI 3.x specifications:

### Swagger 2.0
```yaml
swagger: "2.0"
info:
  title: "My API"
  version: "1.0.0"
paths:
  /users:
    get:
      summary: "Get users"
```

### OpenAPI 3.x
```yaml
openapi: 3.0.0
info:
  title: "My API"
  version: "1.0.0"
paths:
  /users:
    get:
      summary: "Get users"
```

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Troubleshooting

### Port Already in Use
If you get a port conflict error, you can:
1. Change the default port during `init`
2. Specify a different port when serving: `swaggerhub serve --port 4000`
3. Edit the `.swaggerhub.json` file directly

### File Not Found
- Ensure the swagger file path is correct
- Check if the file exists using `swaggerhub list`
- Use `swaggerhub validate` to check for issues

### API Not Loading
- Verify the swagger/openapi file is valid JSON/YAML
- Check console for parsing errors
- Use `swaggerhub validate` to identify issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Ishan-Ravindu**

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/Ishan-Ravindu/swaggerhub-tool/issues) on GitHub.

## Acknowledgments

- [Swagger UI](https://swagger.io/tools/swagger-ui/) for the amazing documentation interface
- [Commander.js](https://github.com/tj/commander.js/) for CLI framework
- [Express](https://expressjs.com/) for the web server
- All the amazing open source contributors

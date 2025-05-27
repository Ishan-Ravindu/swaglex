const inquirer = require("inquirer");
const open = require("open");
const chokidar = require("chokidar");
const ConfigService = require("../services/configService");
const ServerService = require("../services/serverService");
const logger = require("../utils/logger");

module.exports = async (apiId, options) => {
  const config = await ConfigService.load();

  if (config.apis.length === 0) {
    logger.error('No APIs registered. Use "swaggerhub add <file>" first');
    return;
  }

  let api;

  if (!apiId) {
    if (config.apis.length === 1) {
      api = config.apis[0];
    } else {
      const answer = await inquirer.prompt([
        {
          type: "list",
          name: "api",
          message: "Select API to serve:",
          choices: config.apis.map((a) => ({
            name: `${a.title} (${a.id})`,
            value: a,
          })),
        },
      ]);
      api = answer.api;
    }
  } else {
    api = await ConfigService.getApi(apiId);
    if (!api) {
      logger.error(`API not found: ${apiId}`);
      return;
    }
  }

  const port = options.port || api.port;

  logger.info(`Starting Swagger UI for ${api.title} on port ${port}...`);

  const app = ServerService.createApiServer(api);
  await ServerService.startServer(app, port, api.title);

  if (options.open) {
    open(`http://localhost:${port}`);
  }

  // Watch for changes if requested
  if (options.watch) {
    const watcher = chokidar.watch(api.absolutePath);
    watcher.on("change", () => {
      logger.info("Swagger file changed, reload the browser to see updates");
    });
  }
};

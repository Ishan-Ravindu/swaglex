const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const open = require("open");
const ConfigService = require("../services/configService");
const ServerService = require("../services/serverService");
const { getHomepageHTML } = require("../templates/homepage");
const logger = require("../utils/logger");

module.exports = async (options) => {
  const config = await ConfigService.load();
  const port = options.port || 3001;

  logger.info(`Starting SwaggerHub home page on port ${port}...`);

  const app = express();
  app.use(cors());

  // API endpoint to get all APIs
  app.get("/api/list", async (req, res) => {
    const apis = [];

    for (const api of config.apis) {
      const exists = await fs.pathExists(api.absolutePath);
      apis.push({
        ...api,
        exists,
        url: `http://localhost:${api.port}`,
      });
    }

    res.json({
      projectName: config.projectName || "SwaggerHub",
      apis,
    });
  });

  // Start individual API servers
  for (const api of config.apis) {
    if (await fs.pathExists(api.absolutePath)) {
      const apiApp = ServerService.createApiServer(api);
      await ServerService.startServer(apiApp, api.port, api.title);
    }
  }

  // Serve home page
  app.get("/", (req, res) => {
    res.send(getHomepageHTML());
  });

  await ServerService.startServer(app, port, "SwaggerHub home page");

  if (options.open !== false) {
    open(`http://localhost:${port}`);
  }
};

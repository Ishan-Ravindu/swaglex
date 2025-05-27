const express = require("express");
const cors = require("cors");
const path = require("path");
const { parseSwaggerFile } = require("../utils/fileUtils");
const { getSwaggerUITemplate } = require("../templates/swaggerUI");
const logger = require("../utils/logger");

class ServerService {
  static createApiServer(api) {
    const app = express();
    app.use(cors());

    // Serve swagger-ui assets
    app.use(
      "/swagger-ui",
      express.static(
        path.join(__dirname, "../../node_modules/swagger-ui-dist"),
      ),
    );

    // Serve the swagger file
    app.get("/swagger.json", async (req, res) => {
      try {
        const spec = await parseSwaggerFile(api.absolutePath);
        res.json(spec);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Serve the UI
    app.get("/", (req, res) => {
      res.send(getSwaggerUITemplate(api.title));
    });

    return app;
  }

  static startServer(app, port, name) {
    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        logger.info(`${name} running at http://localhost:${port}`);
        resolve(server);
      });
    });
  }
}

module.exports = ServerService;

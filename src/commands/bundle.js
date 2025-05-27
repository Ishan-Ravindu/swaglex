const fs = require("fs-extra");
const ConfigService = require("../services/configService");
const SwaggerService = require("../services/swaggerService");
const logger = require("../utils/logger");

module.exports = async (apiId, output) => {
  const api = await ConfigService.getApi(apiId);
  if (!api) {
    logger.error(`API not found: ${apiId}`);
    return;
  }

  try {
    const spec = await SwaggerService.bundleApi(api);
    const outputPath = output || `${api.id}-bundled.json`;

    await fs.writeJson(outputPath, spec, { spaces: 2 });
    logger.success(`Bundled API saved to: ${outputPath}`);
  } catch (error) {
    logger.error(`Failed to bundle API: ${error.message}`);
  }
};

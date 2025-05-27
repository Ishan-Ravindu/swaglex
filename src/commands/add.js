const inquirer = require("inquirer");
const ConfigService = require("../services/configService");
const SwaggerService = require("../services/swaggerService");
const { findSwaggerFiles } = require("../utils/fileUtils");
const logger = require("../utils/logger");

module.exports = async (swaggerFile, options) => {
  const config = await ConfigService.load();

  if (!swaggerFile) {
    // Interactive mode - find swagger files
    const files = await findSwaggerFiles();

    if (files.length === 0) {
      logger.error("No swagger files found in the current directory");
      return;
    }

    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "file",
        message: "Select swagger file to add:",
        choices: files,
      },
    ]);

    swaggerFile = answer.file;
  }

  try {
    const basePort = config.port + config.apis.length + 1;
    const apiInfo = await SwaggerService.createApiInfo(
      swaggerFile,
      options,
      basePort,
    );

    await ConfigService.addApi(apiInfo);

    logger.success(`Added: ${apiInfo.title} (${apiInfo.file})`);
    logger.info(`Assigned port: ${apiInfo.port}`);
  } catch (error) {
    logger.error(error.message);
  }
};

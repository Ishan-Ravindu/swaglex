const inquirer = require("inquirer");
const ConfigService = require("../services/configService");
const logger = require("../utils/logger");

module.exports = async (apiId) => {
  const config = await ConfigService.load();

  if (!apiId) {
    if (config.apis.length === 0) {
      logger.info("No APIs to remove");
      return;
    }

    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "api",
        message: "Select API to remove:",
        choices: config.apis.map((api) => ({
          name: `${api.title} (${api.id})`,
          value: api.id,
        })),
      },
    ]);

    apiId = answer.api;
  }

  try {
    const removed = await ConfigService.removeApi(apiId);
    logger.success(`Removed: ${removed.title}`);
  } catch (error) {
    logger.error(error.message);
  }
};

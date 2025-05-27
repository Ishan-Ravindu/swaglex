const path = require("path");
const inquirer = require("inquirer");
const ConfigService = require("../services/configService");
const logger = require("../utils/logger");
const { validatePort } = require("../utils/validators");
const { THEMES } = require("../constants");

module.exports = async () => {
  logger.info("Initializing SwaggerHub configuration...");

  const config = await ConfigService.load();

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: path.basename(process.cwd()),
    },
    {
      type: "input",
      name: "port",
      message: "Default port for API documentation:",
      default: config.port || 3000,
      validate: validatePort,
    },
    {
      type: "list",
      name: "theme",
      message: "UI theme:",
      choices: THEMES,
      default: config.theme || "default",
    },
  ]);

  config.projectName = answers.projectName;
  config.port = parseInt(answers.port);
  config.theme = answers.theme;

  await ConfigService.save(config);

  // Add to global projects
  const globalConfig = await ConfigService.getGlobal();
  const projectPath = process.cwd();

  if (!globalConfig.projects.find((p) => p.path === projectPath)) {
    globalConfig.projects.push({
      name: answers.projectName,
      path: projectPath,
      config: ".swaggerhub.json",
    });
    await ConfigService.saveGlobal(globalConfig);
  }

  logger.success("SwaggerHub initialized successfully!");
};

const fs = require("fs-extra");
const chalk = require("chalk");
const Table = require("cli-table3");
const ConfigService = require("../services/configService");
const { parseSwaggerFile } = require("../utils/fileUtils");
const { validateSwaggerSpec } = require("../utils/validators");
const logger = require("../utils/logger");

module.exports = async (apiId) => {
  const config = await ConfigService.load();

  let apisToValidate = [];

  if (apiId) {
    const api = await ConfigService.getApi(apiId);
    if (!api) {
      logger.error(`API not found: ${apiId}`);
      return;
    }
    apisToValidate = [api];
  } else {
    apisToValidate = config.apis;
  }

  const table = new Table({
    head: ["API", "Status", "Issues"],
    colWidths: [30, 15, 50],
  });

  for (const api of apisToValidate) {
    try {
      if (!(await fs.pathExists(api.absolutePath))) {
        table.push([api.title, chalk.red("Missing"), "File not found"]);
        continue;
      }

      const spec = await parseSwaggerFile(api.absolutePath);
      const issues = validateSwaggerSpec(spec);

      if (issues.length === 0) {
        table.push([api.title, chalk.green("Valid"), "No issues found"]);
      } else {
        table.push([api.title, chalk.yellow("Warning"), issues.join(", ")]);
      }
    } catch (error) {
      table.push([api.title, chalk.red("Error"), error.message]);
    }
  }

  console.log("\nValidation Results:");
  console.log(table.toString());
};

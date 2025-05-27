const fs = require("fs-extra");
const chalk = require("chalk");
const Table = require("cli-table3");
const ConfigService = require("../services/configService");
const logger = require("../utils/logger");

module.exports = async () => {
  const config = await ConfigService.load();

  if (config.apis.length === 0) {
    logger.info(
      'No APIs registered. Use "swaggerhub add <file>" to add swagger files',
    );
    return;
  }

  const table = new Table({
    head: ["ID", "Title", "Version", "Port", "File"],
    colWidths: [15, 30, 10, 8, 40],
  });

  for (const api of config.apis) {
    const exists = await fs.pathExists(api.absolutePath);
    table.push([
      api.id,
      api.title,
      api.version,
      api.port,
      exists ? api.file : chalk.red(api.file + " (missing)"),
    ]);
  }

  console.log("\nRegistered APIs:");
  console.log(table.toString());
};

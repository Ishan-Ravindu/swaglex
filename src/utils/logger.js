const chalk = require("chalk");

const logger = {
  info: (msg) => console.log(chalk.blue("ℹ"), msg),
  success: (msg) => console.log(chalk.green("✓"), msg),
  error: (msg) => console.log(chalk.red("✗"), msg),
  warning: (msg) => console.log(chalk.yellow("⚠"), msg),
};

module.exports = logger;

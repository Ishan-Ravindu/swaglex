#!/usr/bin/env node

const { program } = require("commander");
const {
  initCommand,
  addCommand,
  listCommand,
  removeCommand,
  serveCommand,
  homeCommand,
  validateCommand,
} = require("../src/commands");
const { HOMEPAGE_PORT } = require("../src/constants");

// CLI Setup
program
  .name("swaggerhub")
  .description("General purpose Swagger documentation management tool")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize SwaggerHub in current directory")
  .action(initCommand);

program
  .command("add [file]")
  .description("Add a swagger file to the hub")
  .option("-i, --id <id>", "Custom ID for the API")
  .option("-p, --port <port>", "Custom port for this API")
  .action(addCommand);

program
  .command("list")
  .alias("ls")
  .description("List all registered APIs")
  .action(listCommand);

program
  .command("remove [id]")
  .alias("rm")
  .description("Remove an API from the hub")
  .action(removeCommand);

program
  .command("serve [id]")
  .description("Serve a specific API documentation")
  .option("-p, --port <port>", "Override default port")
  .option("-w, --watch", "Watch for file changes")
  .option("-o, --open", "Open in browser")
  .action(serveCommand);

program
  .command("home")
  .description("Start the SwaggerHub home page with all APIs")
  .option("-p, --port <port>", "Port for home page", HOMEPAGE_PORT)
  .option("--no-open", "Do not open browser")
  .action(homeCommand);

program
  .command("validate [id]")
  .description("Validate swagger specifications")
  .action(validateCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

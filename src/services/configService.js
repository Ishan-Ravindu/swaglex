const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const { CONFIG_FILE, DEFAULT_PORT } = require("../constants");
const logger = require("../utils/logger");

class ConfigService {
  static async load() {
    try {
      const configPath = path.join(process.cwd(), CONFIG_FILE);
      if (await fs.pathExists(configPath)) {
        return await fs.readJson(configPath);
      }
    } catch (error) {
      logger.warning("No config file found, creating new one...");
    }
    return {
      apis: [],
      port: DEFAULT_PORT,
      theme: "default",
    };
  }

  static async save(config) {
    const configPath = path.join(process.cwd(), CONFIG_FILE);
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  static async getGlobal() {
    const homeDir = os.homedir();
    const globalConfigPath = path.join(homeDir, ".swaggerhub", "config.json");

    try {
      if (await fs.pathExists(globalConfigPath)) {
        return await fs.readJson(globalConfigPath);
      }
    } catch (error) {
      // Ignore error
    }

    return { projects: [] };
  }

  static async saveGlobal(config) {
    const homeDir = os.homedir();
    const globalConfigDir = path.join(homeDir, ".swaggerhub");
    const globalConfigPath = path.join(globalConfigDir, "config.json");

    await fs.ensureDir(globalConfigDir);
    await fs.writeJson(globalConfigPath, config, { spaces: 2 });
  }

  static async addApi(apiInfo) {
    const config = await this.load();

    // Check if already exists
    if (config.apis.find((api) => api.absolutePath === apiInfo.absolutePath)) {
      throw new Error("This swagger file is already added");
    }

    config.apis.push(apiInfo);
    await this.save(config);
  }

  static async removeApi(apiId) {
    const config = await this.load();
    const index = config.apis.findIndex((api) => api.id === apiId);

    if (index === -1) {
      throw new Error(`API not found: ${apiId}`);
    }

    const removed = config.apis.splice(index, 1)[0];
    await this.save(config);
    return removed;
  }

  static async getApi(apiId) {
    const config = await this.load();
    return config.apis.find((api) => api.id === apiId);
  }
}

module.exports = ConfigService;

const path = require("path");
const fs = require("fs-extra");
const { parseSwaggerFile, generateId } = require("../utils/fileUtils");

class SwaggerService {
  static async createApiInfo(swaggerFile, options, basePort) {
    const absolutePath = path.resolve(swaggerFile);

    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`File not found: ${swaggerFile}`);
    }

    const spec = await parseSwaggerFile(absolutePath);

    return {
      id:
        options.id || generateId(spec.info.title || path.basename(swaggerFile)),
      file: swaggerFile,
      absolutePath: absolutePath,
      title: spec.info.title || "Untitled API",
      version: spec.info.version || "1.0.0",
      description: spec.info.description || "",
      port: options.port || basePort,
    };
  }

  static async bundleApi(apiInfo) {
    const spec = await parseSwaggerFile(apiInfo.absolutePath);
    return spec;
  }
}

module.exports = SwaggerService;

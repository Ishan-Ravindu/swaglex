const fs = require("fs-extra");
const yaml = require("js-yaml");
const { glob } = require("glob");
const { SWAGGER_FILE_PATTERNS, IGNORE_PATTERNS } = require("../constants");

const parseSwaggerFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    let spec;

    if (filePath.endsWith(".yaml") || filePath.endsWith(".yml")) {
      spec = yaml.load(content);
    } else if (filePath.endsWith(".json")) {
      spec = JSON.parse(content);
    } else {
      throw new Error("Unsupported file format. Use .yaml, .yml, or .json");
    }

    return spec;
  } catch (error) {
    throw new Error(`Failed to parse swagger file: ${error.message}`);
  }
};

const findSwaggerFiles = async (dir = ".") => {
  const files = [];

  for (const pattern of SWAGGER_FILE_PATTERNS) {
    const matches = await glob(pattern, {
      cwd: dir,
      ignore: IGNORE_PATTERNS,
    });
    files.push(...matches);
  }

  return [...new Set(files)];
};

const generateId = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

module.exports = {
  parseSwaggerFile,
  findSwaggerFiles,
  generateId,
};

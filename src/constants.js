module.exports = {
  CONFIG_FILE: ".swaggerhub.json",
  DEFAULT_PORT: 3000,
  HOMEPAGE_PORT: 3001,
  SWAGGER_FILE_PATTERNS: [
    "**/*.swagger.json",
    "**/*.swagger.yaml",
    "**/*.swagger.yml",
    "**/swagger.json",
    "**/swagger.yaml",
    "**/openapi.json",
    "**/openapi.yaml",
  ],
  IGNORE_PATTERNS: ["node_modules/**", "dist/**", "build/**"],
  THEMES: ["default", "dark", "material", "feeling-blue"],
};

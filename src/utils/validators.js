const validateSwaggerSpec = (spec) => {
  const issues = [];

  if (!spec.info) issues.push("Missing info object");
  if (!spec.paths || Object.keys(spec.paths).length === 0)
    issues.push("No paths defined");

  if (spec.openapi) {
    if (!spec.openapi.startsWith("3.")) issues.push("Invalid OpenAPI version");
  } else if (spec.swagger) {
    if (spec.swagger !== "2.0") issues.push("Invalid Swagger version");
  } else {
    issues.push("Missing version field (openapi or swagger)");
  }

  return issues;
};

const validatePort = (input) => {
  const port = parseInt(input);
  return port > 0 && port < 65536 ? true : "Please enter a valid port number";
};

module.exports = {
  validateSwaggerSpec,
  validatePort,
};

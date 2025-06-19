// scripts/generate-api-docs.js
// Auto-generates OpenAPI spec markdown summary for documentation
const fs = require('fs');
const yaml = require('js-yaml');

const openapi = yaml.load(fs.readFileSync('backend/openapi.yaml', 'utf8'));

let md = '# FuelSync Hub - API Endpoints (Summary)\n\n';
for (const [path, methods] of Object.entries(openapi.paths)) {
  for (const [method, details] of Object.entries(methods)) {
    md += `- [${method.toUpperCase()}] \`${path}\`: ${details.summary || ''}\n`;
  }
}

fs.writeFileSync('planning/api-summary.md', md);
console.log('api-summary.md updated!');

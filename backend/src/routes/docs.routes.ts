import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = Router();

// Load OpenAPI document
const swaggerDocument = YAML.load(path.join(__dirname, '../../openapi.yaml'));

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

export default router;
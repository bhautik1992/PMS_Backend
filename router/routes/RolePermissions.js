import express from 'express';
import { index, assignPermissions } from '../../controllers/RolePermissionsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);
router.post('/assign', protectRoute, assignPermissions);

export default router;



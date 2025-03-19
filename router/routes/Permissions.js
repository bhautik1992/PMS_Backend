import express from 'express';
import { index, create, destroy, edit, getAllPermissions } from '../../controllers/PermissionsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);
router.get('/all', protectRoute, getAllPermissions);
router.post('/create', protectRoute, create);
router.get('/edit/:id', protectRoute, edit);
router.post('/destroy', protectRoute, destroy);

export default router;



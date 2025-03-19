import express from 'express';
import { index, create, destroy, edit, update } from '../../controllers/TasksController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);
router.post('/create', protectRoute, create);
router.post('/destroy', protectRoute, destroy);
router.get('/edit/:id', protectRoute, edit);
router.post('/update', protectRoute, update);

export default router;



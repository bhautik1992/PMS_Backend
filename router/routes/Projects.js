import express from 'express';
import { index, create, edit, update, duration, destroy } from '../../controllers/ProjectsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/:userId?', protectRoute, index);
router.post('/create', protectRoute, create);
router.get('/edit/:id', protectRoute, edit);
router.post('/update', protectRoute, update);
router.post('/destroy', protectRoute, destroy);
router.get('/duration/:id', protectRoute, duration);

export default router;



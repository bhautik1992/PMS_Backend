import express from 'express';
import { index, create, edit, update, duration } from '../../controllers/ProjectsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/:userId?', protectRoute, index);
router.post('/create', protectRoute, create);
router.get('/edit/:id', protectRoute, edit);
router.post('/update', protectRoute, update);
router.get('/duration/:id', protectRoute, duration);

export default router;



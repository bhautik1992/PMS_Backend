import express from 'express';
import { index, create, edit, update } from '../../controllers/ClientsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);
router.post('/create', protectRoute, create);
router.get('/edit/:id', protectRoute, edit);
router.post('/update', protectRoute, update);

export default router;



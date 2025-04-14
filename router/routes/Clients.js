import express from 'express';
import { index, listing, create, edit, update, destroy } from '../../controllers/ClientsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);
router.get('/listing', protectRoute, listing);
router.post('/create', protectRoute, create);
router.get('/edit/:id', protectRoute, edit);
router.post('/update', protectRoute, update);
router.post('/destroy', protectRoute, destroy);

export default router;



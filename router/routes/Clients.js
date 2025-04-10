import express from 'express';
import { index, create } from '../../controllers/ClientsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);
router.post('/create', protectRoute, create);

export default router;



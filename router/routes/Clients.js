import express from 'express';
import { index } from '../../controllers/ClientsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

router.get('/', protectRoute, index);

export default router;



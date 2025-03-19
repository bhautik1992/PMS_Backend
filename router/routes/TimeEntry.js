import express from 'express';
import { create } from '../../controllers/TimeEntryController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

// router.get('/', protectRoute, index);
router.post('/create', protectRoute, create);

export default router;



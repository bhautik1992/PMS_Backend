import express from 'express';
import { create, history, report } from '../../controllers/TimeEntryController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

// router.get('/', protectRoute, index);
router.get('/report', protectRoute, report);
router.post('/create', protectRoute, create);
router.get('/history/:taskId', protectRoute, history);

export default router;


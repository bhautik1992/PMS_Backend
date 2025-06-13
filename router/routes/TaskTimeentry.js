import express from 'express';
import { userAllTask } from '../../controllers/TaskTimeEntryController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();


router.post('/', protectRoute, userAllTask);

export default router;

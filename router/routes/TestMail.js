import express from 'express';
import { sendTestMail } from '../../controllers/TestMailController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();

// POST /api/test-mail { to: "email@example.com" }
router.post('/', protectRoute, sendTestMail);

export default router;

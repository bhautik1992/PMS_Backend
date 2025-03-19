import express from 'express';
import { getSettings, saveSettings } from '../../controllers/SettingsController.js';
import { protectRoute } from '../../middleware/Authenticate.js';

const router = express.Router();
router.route('/').get(protectRoute, getSettings).post(protectRoute, saveSettings);

export default router;



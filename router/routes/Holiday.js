import express from "express";
import { protectRoute } from "../../middleware/Authenticate.js";
import { create, index , edit, destroy } from "../../controllers/HolidayController.js";

const router = express.Router();

router.get("/", protectRoute, index);
router.post("/create", protectRoute, create);
router.get('/edit/:id', protectRoute, edit);
router.post("/destroy", protectRoute, destroy);

export default router;



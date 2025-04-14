import express from "express";
import { protectRoute } from "../../middleware/Authenticate.js";
import { create, getHoliday , updateHoliday , deleteHoliday } from "../../controllers/HolidayController.js";

const router = express.Router();

router.get("/", protectRoute, getHoliday);
router.post("/create", protectRoute, create);
router.put("/update/:id", protectRoute, updateHoliday);
router.delete("/delete/:id", protectRoute, deleteHoliday);


export default router;

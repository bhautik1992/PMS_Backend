import express from "express";
import { protectRoute } from "../../middleware/Authenticate.js";
import {
    getState,
    editState,
    createState,
    destroy,
} from "../../controllers/StateController.js";

const router = express.Router();

router.get("/:countryId", protectRoute, getState);
router.post("/create", protectRoute, createState);
router.put("/edit",protectRoute,editState)
router.post("/destroy", protectRoute, destroy);

export default router;

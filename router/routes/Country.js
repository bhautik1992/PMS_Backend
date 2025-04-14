import express from "express";
import { protectRoute } from "../../middleware/Authenticate.js";
import {
  createCountry,
  getCountries,
  updateCountry,
  deleteCountry,
} from "../../controllers/CountryController.js";

const router = express.Router();

router.get("/", protectRoute, getCountries);
router.post("/create", protectRoute, createCountry);
router.put("/update/:id", protectRoute, updateCountry);
router.delete("/delete/:id", protectRoute, deleteCountry);

export default router;

import express from "express";
const router = express.Router();
const app = express();
import {
  getSettings,
  saveSettings,
} from "../../controllers/SettingsController.js";
import { protectRoute } from "../../middleware/Authenticate.js";
import multer from "multer";

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.route("/").get(protectRoute, getSettings);
router
  .route("/")
  .post(protectRoute, upload.single("company_image"), saveSettings);

export default router;

import express from 'express';
import { createUser, getUsers, updateProfile, changePassword, getBankDetails, handleUserPermission, assignPermissions } from '../../controllers/UserController.js';
import { protectRoute } from '../../middleware/Authenticate.js';
import upload from '../../middleware/multer.js';

const router = express.Router();

router.route('/').get(protectRoute, getUsers).post(protectRoute, createUser);

router.post(
    "/profile/:userId", 
    protectRoute, 
    (req, res, next) => {
        req.directory    = 'uploads/profile';
        req.allowedTypes = ["image/jpg", "image/jpeg", "image/png"];
        next();
    }, 
    upload.single("profile_photo"), 
    updateProfile
);

router.post('/change_password/:userId', protectRoute, changePassword);
router.get('/bank_details/:userId', protectRoute, getBankDetails);
router.get('/permissions/:userId', protectRoute, handleUserPermission);
router.post('/permissions/assign', protectRoute, assignPermissions);

export default router;



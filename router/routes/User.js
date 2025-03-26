import express from 'express';
import { 
    createUser, getUsers, edit, update, destroy,
    updateProfile, changePassword, 
    getBankDetails, handleUserPermission, 
    assignPermissions, generateEmployeeCode 
} from '../../controllers/UserController.js';
import { protectRoute } from '../../middleware/Authenticate.js';
import upload from '../../middleware/multer.js';

const router = express.Router();

router.route('/').get(protectRoute, getUsers).post(protectRoute, createUser);
router.get('/edit/:id', protectRoute, edit);
router.post('/update', protectRoute, update);
router.post('/destroy', protectRoute, destroy);

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
router.get('/generate/employee_code', protectRoute, generateEmployeeCode);

export default router;



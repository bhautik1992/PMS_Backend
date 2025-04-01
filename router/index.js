import express from 'express';
import User from './routes/User.js';
import Login from './routes/Login.js';
import Settings from './routes/Settings.js';
import Roles from './routes/Roles.js';
import Permissions from './routes/Permissions.js';
import RolePermissions from './routes/RolePermissions.js';
import Projects from './routes/Projects.js';
import Tasks from './routes/Tasks.js';
import TimeEntry from './routes/TimeEntry.js';
import Clients from './routes/Clients.js';
import { forgotPassword } from '../controllers/ForgotPasswordController.js';
import { resetPassword } from '../controllers/ResetPasswordController.js';

const router = express.Router();
router.use('/login', Login);
router.use('/user', User);
router.use('/settings', Settings);
router.use('/roles', Roles);
router.use('/permissions', Permissions);
router.use('/role_permissions', RolePermissions);
router.use('/projects', Projects);
router.use('/tasks', Tasks);
router.use('/time_entry', TimeEntry);
router.use('/clients', Clients);

router.post('/forgot_password', forgotPassword);
router.post('/reset_password', resetPassword);

export default router;



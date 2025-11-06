import express from 'express';
import { getProfile, updateProfile, getUserById } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, updateProfile);
router.get('/:userId', authenticateToken, getUserById);

export default router;

import express from 'express';
import { getOnlineUsers, updateLastSeen } from '../controllers/videoController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/online-users', authenticateToken, getOnlineUsers);
router.post('/update-last-seen', authenticateToken, updateLastSeen);

export default router;

import express from 'express';
import { findRandomCallPartner, updateCallStatus, getCallHistory } from '../controllers/callController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/random', authenticateToken, findRandomCallPartner);
router.put('/status', authenticateToken, updateCallStatus);
router.get('/history', authenticateToken, getCallHistory);

export default router;

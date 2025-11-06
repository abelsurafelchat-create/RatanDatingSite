import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecommendations, swipe, getMatches, getNewMatchCount } from '../controllers/matchController.js';

const router = express.Router();

router.get('/recommendations', authenticateToken, getRecommendations);
router.post('/swipe', authenticateToken, swipe);
router.get('/list', authenticateToken, getMatches);
router.get('/new-count', authenticateToken, getNewMatchCount);

export default router;

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecommendations, swipe, getMatches, getLikes, getNewMatchCount } from '../controllers/matchController.js';

const router = express.Router();

router.get('/recommendations', authenticateToken, getRecommendations);
router.post('/swipe', authenticateToken, swipe);
router.get('/list', authenticateToken, getMatches);
router.get('/likes', authenticateToken, getLikes);
router.get('/new-count', authenticateToken, getNewMatchCount);

export default router;

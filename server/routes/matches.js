import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getRecommendations, swipe, getMatches, getLikes, getNewMatchCount } from '../controllers/matchController.js';
import pool from '../database/db.js';

const router = express.Router();

router.get('/recommendations', authenticateToken, getRecommendations);
router.post('/swipe', authenticateToken, swipe);
router.get('/list', authenticateToken, getMatches);
router.get('/likes', authenticateToken, getLikes);
router.get('/new-count', authenticateToken, getNewMatchCount);

// Test endpoint to check likes functionality
router.get('/test-likes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM swipes WHERE swiper_id = $1 AND swipe_type = $2',
      [userId, 'like']
    );
    res.json({ 
      message: 'Likes test endpoint working',
      userId,
      totalLikes: result.rows[0].count 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

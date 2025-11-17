import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getAdminStats, 
  getAdminUsers, 
  manageUser, 
  getMatchStats, 
  getMessageStats 
} from '../controllers/adminController.js';

const router = express.Router();

// Admin dashboard statistics
router.get('/stats', authenticateToken, getAdminStats);

// User management
router.get('/users', authenticateToken, getAdminUsers);
router.post('/users/:userId/:action', authenticateToken, manageUser);

// Match statistics
router.get('/matches/stats', authenticateToken, getMatchStats);

// Message statistics
router.get('/messages/stats', authenticateToken, getMessageStats);

// Temporary endpoint to make yourself admin (remove after use)
router.post('/make-admin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Add role column if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);
    
    // Make current user admin
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role',
      ['admin', userId]
    );
    
    res.json({ 
      message: 'You are now an admin!', 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to make admin' });
  }
});

export default router;

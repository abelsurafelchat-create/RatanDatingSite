import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getConversations, getMessages, sendMessage, getUnreadCount } from '../controllers/chatController.js';

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/messages/:userId', authenticateToken, getMessages);
router.post('/send', authenticateToken, sendMessage);
router.get('/unread-count', authenticateToken, getUnreadCount);

export default router;

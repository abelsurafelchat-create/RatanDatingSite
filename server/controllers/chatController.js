import pool from '../database/db.js';

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await pool.query(
      `SELECT DISTINCT ON (other_user_id)
         other_user_id,
         u.full_name,
         u.profile_photo,
         u.is_active as online,
         last_message,
         last_message_time,
         unread_count
       FROM (
         SELECT 
           CASE 
             WHEN sender_id = $1 THEN receiver_id 
             ELSE sender_id 
           END as other_user_id,
           message_text as last_message,
           created_at as last_message_time,
           (SELECT COUNT(*) FROM messages 
            WHERE sender_id = CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END 
            AND receiver_id = $1 
            AND is_read = false) as unread_count
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         ORDER BY created_at DESC
       ) conv
       JOIN users u ON u.id = conv.other_user_id
       ORDER BY other_user_id, last_message_time DESC`,
      [userId]
    );

    res.json(conversations.rows);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.userId); // Fixed: was otherUserId, should be userId from route
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    console.log('Getting messages between:', userId, 'and', otherUserId);

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
      [otherUserId, userId]
    );

    const messages = await pool.query(
      `SELECT m.id, m.sender_id, m.receiver_id, m.message_text, 
              m.is_read, m.created_at, m.message_type, m.media_data,
              u.full_name as sender_name, u.profile_photo as sender_photo
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, otherUserId, limit, offset]
    );

    console.log('Found messages:', messages.rows.length);

    res.json(messages.rows.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { receiverId, messageText, messageType, mediaData } = req.body;

    if (!receiverId || !messageText) {
      return res.status(400).json({ error: 'Receiver and message required' });
    }

    // Check if users are matched
    const matchCheck = await pool.query(
      `SELECT * FROM matches 
       WHERE ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))
       AND is_active = true`,
      [userId, receiverId]
    );

    if (matchCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Can only message matched users' });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message_text, message_type, media_data) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [userId, receiverId, messageText, messageType || 'text', mediaData || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE receiver_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

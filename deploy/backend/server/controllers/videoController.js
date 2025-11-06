import pool from '../database/db.js';

// Store active socket connections
let activeSocketUsers = new Set();

export const setActiveUsers = (users) => {
  activeSocketUsers = new Set(users);
};

export const getActiveUsers = () => {
  return activeSocketUsers;
};

export const getOnlineUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Getting online users for user:', userId);
    console.log('Active socket users:', Array.from(activeSocketUsers));
    
    // Get only users who have active socket connections AND recent last_seen
    const onlineUsers = await pool.query(
      `SELECT u.id, u.full_name, u.profile_photo, u.gender, 
              EXTRACT(YEAR FROM AGE(u.date_of_birth)) as age,
              u.last_seen
       FROM users u
       WHERE u.id != $1
         AND u.is_active = true
         AND u.last_seen > NOW() - INTERVAL '2 minutes'
       ORDER BY u.last_seen DESC
       LIMIT 50`,
      [userId]
    );

    // Filter to only include users with active socket connections
    const activeOnlineUsers = onlineUsers.rows.filter(user => 
      activeSocketUsers.has(user.id)
    );

    console.log('Found online users in DB:', onlineUsers.rows.length);
    console.log('Active online users with sockets:', activeOnlineUsers.length);

    res.json(activeOnlineUsers);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
};

export const updateLastSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Updating last_seen for user:', userId);
    
    await pool.query(
      'UPDATE users SET last_seen = NOW() WHERE id = $1',
      [userId]
    );

    console.log('Last_seen updated successfully for user:', userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Update last seen error:', error);
    res.status(500).json({ error: 'Failed to update last seen' });
  }
};

import pool from '../database/db.js';

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Get total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get active users (logged in within last 30 days)
    const activeUsersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE last_seen > NOW() - INTERVAL '30 days' AND is_active = true`
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Get total matches
    const totalMatchesResult = await pool.query('SELECT COUNT(*) as count FROM matches WHERE is_active = true');
    const totalMatches = parseInt(totalMatchesResult.rows[0].count);

    // Get messages today
    const messagesTodayResult = await pool.query(
      `SELECT COUNT(*) as count FROM messages 
       WHERE created_at >= CURRENT_DATE`
    );
    const messagesToday = parseInt(messagesTodayResult.rows[0].count);

    // Get recent activity (last 10 activities)
    const recentActivityResult = await pool.query(
      `SELECT 
         'New user registered: ' || u.full_name as description,
         u.created_at as timestamp
       FROM users u
       WHERE u.created_at > NOW() - INTERVAL '7 days'
       ORDER BY u.created_at DESC
       LIMIT 5`
    );

    const matchActivityResult = await pool.query(
      `SELECT 
         'New match created' as description,
         m.matched_at as timestamp
       FROM matches m
       WHERE m.matched_at > NOW() - INTERVAL '7 days'
       ORDER BY m.matched_at DESC
       LIMIT 5`
    );

    const recentActivity = [
      ...recentActivityResult.rows.map(row => ({
        description: row.description,
        timestamp: new Date(row.timestamp).toLocaleString()
      })),
      ...matchActivityResult.rows.map(row => ({
        description: row.description,
        timestamp: new Date(row.timestamp).toLocaleString()
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      totalUsers,
      activeUsers,
      totalMatches,
      messagesToday,
      recentActivity
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
};

// Get all users with additional info
export const getAdminUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const users = await pool.query(
      `SELECT 
         u.id,
         u.full_name,
         u.email,
         u.gender,
         u.profile_photo,
         u.is_active,
         u.created_at,
         u.last_seen,
         COUNT(DISTINCT m1.id) + COUNT(DISTINCT m2.id) as match_count
       FROM users u
       LEFT JOIN matches m1 ON u.id = m1.user1_id
       LEFT JOIN matches m2 ON u.id = m2.user2_id
       GROUP BY u.id, u.full_name, u.email, u.gender, u.profile_photo, u.is_active, u.created_at, u.last_seen
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(users.rows);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// User management actions
export const manageUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    const { action } = req.params;

    switch (action) {
      case 'activate':
        await pool.query('UPDATE users SET is_active = true WHERE id = $1', [userId]);
        res.json({ message: 'User activated successfully' });
        break;

      case 'deactivate':
        await pool.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
        res.json({ message: 'User deactivated successfully' });
        break;

      case 'delete':
        // Soft delete - just deactivate
        await pool.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
        res.json({ message: 'User deleted successfully' });
        break;

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Manage user error:', error);
    res.status(500).json({ error: 'Failed to manage user' });
  }
};

// Get match statistics
export const getMatchStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Matches per day for the last 30 days
    const matchesPerDay = await pool.query(
      `SELECT 
         DATE(matched_at) as date,
         COUNT(*) as count
       FROM matches
       WHERE matched_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(matched_at)
       ORDER BY date DESC`
    );

    // Top active users by matches
    const topUsers = await pool.query(
      `SELECT 
         u.full_name,
         u.profile_photo,
         COUNT(DISTINCT m1.id) + COUNT(DISTINCT m2.id) as match_count
       FROM users u
       LEFT JOIN matches m1 ON u.id = m1.user1_id
       LEFT JOIN matches m2 ON u.id = m2.user2_id
       WHERE u.is_active = true
       GROUP BY u.id, u.full_name, u.profile_photo
       HAVING COUNT(DISTINCT m1.id) + COUNT(DISTINCT m2.id) > 0
       ORDER BY match_count DESC
       LIMIT 10`
    );

    res.json({
      matchesPerDay: matchesPerDay.rows,
      topUsers: topUsers.rows
    });
  } catch (error) {
    console.error('Get match stats error:', error);
    res.status(500).json({ error: 'Failed to fetch match statistics' });
  }
};

// Get message statistics
export const getMessageStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Messages per day for the last 30 days
    const messagesPerDay = await pool.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as count
       FROM messages
       WHERE created_at > NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Most active conversations
    const activeConversations = await pool.query(
      `SELECT 
         c.id,
         u1.full_name as user1_name,
         u2.full_name as user2_name,
         COUNT(m.id) as message_count,
         MAX(m.created_at) as last_message
       FROM conversations c
       JOIN users u1 ON c.user1_id = u1.id
       JOIN users u2 ON c.user2_id = u2.id
       LEFT JOIN messages m ON c.id = m.conversation_id
       GROUP BY c.id, u1.full_name, u2.full_name
       ORDER BY message_count DESC
       LIMIT 10`
    );

    res.json({
      messagesPerDay: messagesPerDay.rows,
      activeConversations: activeConversations.rows
    });
  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({ error: 'Failed to fetch message statistics' });
  }
};

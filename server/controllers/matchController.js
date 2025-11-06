import pool from '../database/db.js';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    // Get current user info and preferences
    const userResult = await pool.query(
      `SELECT u.*, up.preferred_gender, up.min_age, up.max_age, up.preferred_castes
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = userResult.rows[0];
    
    // Set default values
    const preferredGender = currentUser.preferred_gender || (currentUser.gender === 'male' ? 'female' : 'male');
    const minAge = currentUser.min_age || 18;
    const maxAge = currentUser.max_age || 50;

    // Get users that:
    // 1. Same registration type (dating/marriage)
    // 2. Match gender preference
    // 3. Not already swiped
    // 4. Not blocked
    // 5. Age range matches
    const recommendations = await pool.query(
      `SELECT u.id, u.full_name, u.gender, u.date_of_birth, 
              u.registration_type, u.caste, u.location, u.bio, u.profile_photo,
              EXTRACT(YEAR FROM AGE(u.date_of_birth)) as age
       FROM users u
       WHERE u.id != $1
         AND u.is_active = true
         AND u.registration_type = $2
         AND u.gender = $3
         AND EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN $4 AND $5
         AND u.id NOT IN (
           SELECT swiped_id FROM swipes WHERE swiper_id = $1
         )
         AND u.id NOT IN (
           SELECT blocked_id FROM blocked_users WHERE blocker_id = $1
         )
         AND u.id NOT IN (
           SELECT blocker_id FROM blocked_users WHERE blocked_id = $1
         )
       ORDER BY RANDOM()
       LIMIT $6`,
      [
        userId,
        currentUser.registration_type,
        preferredGender,
        minAge,
        maxAge,
        limit,
      ]
    );

    // Get photos for each user
    const usersWithPhotos = await Promise.all(
      recommendations.rows.map(async (user) => {
        const photosResult = await pool.query(
          'SELECT photo_url FROM profile_photos WHERE user_id = $1 ORDER BY is_primary DESC LIMIT 5',
          [user.id]
        );
        return {
          ...user,
          photos: photosResult.rows.map(p => p.photo_url),
        };
      })
    );

    res.json(usersWithPhotos);
  } catch (error) {
    console.error('Get recommendations error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

export const swipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { swipedUserId, swipeType } = req.body;

    if (!swipedUserId || !swipeType || !['like', 'dislike'].includes(swipeType)) {
      return res.status(400).json({ error: 'Invalid swipe data' });
    }

    // Record the swipe
    await pool.query(
      'INSERT INTO swipes (swiper_id, swiped_id, swipe_type) VALUES ($1, $2, $3) ON CONFLICT (swiper_id, swiped_id) DO UPDATE SET swipe_type = $3',
      [userId, swipedUserId, swipeType]
    );

    let isMatch = false;

    // If it's a like, check for mutual match
    if (swipeType === 'like') {
      const mutualLike = await pool.query(
        'SELECT * FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND swipe_type = $3',
        [swipedUserId, userId, 'like']
      );

      if (mutualLike.rows.length > 0) {
        // Create match (ensure user1_id < user2_id)
        const [user1, user2] = userId < swipedUserId ? [userId, swipedUserId] : [swipedUserId, userId];
        
        await pool.query(
          'INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT (user1_id, user2_id) DO NOTHING',
          [user1, user2]
        );

        isMatch = true;
      }
    }

    res.json({
      message: 'Swipe recorded',
      isMatch,
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
};

export const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await pool.query(
      `SELECT DISTINCT 
         CASE 
           WHEN m.user1_id = $1 THEN m.user2_id 
           ELSE m.user1_id 
         END as matched_user_id,
         m.matched_at,
         u.full_name, u.gender, u.profile_photo, u.bio, u.location,
         EXTRACT(YEAR FROM AGE(u.date_of_birth)) as age
       FROM matches m
       JOIN users u ON (
         CASE 
           WHEN m.user1_id = $1 THEN m.user2_id 
           ELSE m.user1_id 
         END = u.id
       )
       WHERE (m.user1_id = $1 OR m.user2_id = $1)
         AND m.is_active = true
         AND u.is_active = true
       ORDER BY m.matched_at DESC`,
      [userId]
    );

    // Get photos for each matched user
    const matchesWithPhotos = await Promise.all(
      matches.rows.map(async (match) => {
        const photosResult = await pool.query(
          'SELECT photo_url FROM profile_photos WHERE user_id = $1 ORDER BY is_primary DESC',
          [match.matched_user_id]
        );
        return {
          ...match,
          photos: photosResult.rows.map(p => p.photo_url),
        };
      })
    );

    res.json(matchesWithPhotos);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

export const getNewMatchCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Count matches from last 24 hours
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM matches 
       WHERE (user1_id = $1 OR user2_id = $1)
         AND is_active = true
         AND matched_at > NOW() - INTERVAL '24 hours'`,
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get new match count error:', error);
    res.status(500).json({ error: 'Failed to get new match count' });
  }
};

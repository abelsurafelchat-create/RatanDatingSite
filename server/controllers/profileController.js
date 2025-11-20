import pool from '../database/db.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.gender, u.date_of_birth, 
              u.registration_type, u.caste, u.phone, u.location, u.bio, 
              u.profile_photo, u.created_at, u.role,
              up.preferred_gender, up.min_age, up.max_age, up.preferred_castes, up.max_distance
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional photos
    const photosResult = await pool.query(
      'SELECT photo_url FROM profile_photos WHERE user_id = $1 ORDER BY is_primary DESC',
      [userId]
    );

    const profile = {
      ...result.rows[0],
      photos: photosResult.rows.map(p => p.photo_url),
    };

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      email,
      date_of_birth,
      caste,
      phone,
      location,
      bio,
      profile_photo,
      preferred_gender,
      min_age,
      max_age,
      preferred_castes,
      max_distance,
      photos,
    } = req.body;

    console.log('Updating profile for user:', userId);
    console.log('Profile photo length:', profile_photo?.length || 0);
    console.log('Number of photos:', photos?.length || 0);

    // Update user basic info
    await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           date_of_birth = COALESCE($3, date_of_birth),
           caste = COALESCE($4, caste),
           phone = COALESCE($5, phone),
           location = COALESCE($6, location),
           bio = COALESCE($7, bio),
           profile_photo = COALESCE($8, profile_photo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [full_name, email, date_of_birth, caste, phone, location, bio, profile_photo, userId]
    );

    console.log('User info updated');

    // Update or create preferences
    const prefCheck = await pool.query(
      'SELECT user_id FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (prefCheck.rows.length > 0) {
      // Update existing preferences
      await pool.query(
        `UPDATE user_preferences 
         SET preferred_gender = COALESCE($1, preferred_gender),
             min_age = COALESCE($2, min_age),
             max_age = COALESCE($3, max_age),
             preferred_castes = COALESCE($4, preferred_castes),
             max_distance = COALESCE($5, max_distance),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [preferred_gender, min_age, max_age, preferred_castes, max_distance, userId]
      );
    } else {
      // Create new preferences
      await pool.query(
        `INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age, preferred_castes, max_distance)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, preferred_gender || 'female', min_age || 18, max_age || 50, preferred_castes, max_distance]
      );
    }

    console.log('Preferences updated');

    // Handle photos - delete old ones and insert new ones
    if (photos && Array.isArray(photos) && photos.length > 0) {
      console.log('Updating photos...');

      // Delete existing photos
      await pool.query('DELETE FROM profile_photos WHERE user_id = $1', [userId]);

      // Insert new photos
      for (let i = 0; i < photos.length; i++) {
        await pool.query(
          'INSERT INTO profile_photos (user_id, photo_url, is_primary) VALUES ($1, $2, $3)',
          [userId, photos[i], photos[i] === profile_photo]
        );
      }

      console.log('Photos updated');
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.gender, u.date_of_birth, 
              u.registration_type, u.caste, u.location, u.bio, 
              u.profile_photo
       FROM users u
       WHERE u.id = $1 AND u.is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional photos
    const photosResult = await pool.query(
      'SELECT photo_url FROM profile_photos WHERE user_id = $1 ORDER BY is_primary DESC',
      [userId]
    );

    const profile = {
      ...result.rows[0],
      photos: photosResult.rows.map(p => p.photo_url),
    };

    res.json(profile);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

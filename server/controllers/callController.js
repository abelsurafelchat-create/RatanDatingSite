import pool from '../database/db.js';

export const findRandomCallPartner = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user info
    const userResult = await pool.query(
      'SELECT gender, registration_type FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = userResult.rows[0];
    const preferredGender = currentUser.gender === 'male' ? 'female' : 'male';

    // Find a random user of opposite gender with same registration type
    // who is not blocked and hasn't been called recently
    const partner = await pool.query(
      `SELECT id, full_name, profile_photo
       FROM users
       WHERE id != $1
         AND is_active = true
         AND gender = $2
         AND registration_type = $3
         AND id NOT IN (
           SELECT blocked_id FROM blocked_users WHERE blocker_id = $1
         )
         AND id NOT IN (
           SELECT blocker_id FROM blocked_users WHERE blocked_id = $1
         )
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId, preferredGender, currentUser.registration_type]
    );

    if (partner.rows.length === 0) {
      return res.status(404).json({ error: 'No available partners at the moment' });
    }

    // Create call record
    const callResult = await pool.query(
      `INSERT INTO video_calls (caller_id, receiver_id, call_type, call_status)
       VALUES ($1, $2, 'random', 'pending')
       RETURNING id`,
      [userId, partner.rows[0].id]
    );

    res.json({
      callId: callResult.rows[0].id,
      partner: partner.rows[0],
    });
  } catch (error) {
    console.error('Find random partner error:', error);
    res.status(500).json({ error: 'Failed to find partner' });
  }
};

export const updateCallStatus = async (req, res) => {
  try {
    const { callId, status, duration } = req.body;

    if (!callId || !status) {
      return res.status(400).json({ error: 'Call ID and status required' });
    }

    const updates = ['call_status = $1'];
    const values = [status, callId];
    let paramCount = 2;

    if (status === 'ongoing') {
      updates.push('started_at = CURRENT_TIMESTAMP');
    }

    if (status === 'completed' || status === 'rejected') {
      updates.push('ended_at = CURRENT_TIMESTAMP');
      if (duration) {
        paramCount++;
        updates.push(`duration = $${paramCount}`);
        values.splice(paramCount - 1, 0, duration);
      }
    }

    await pool.query(
      `UPDATE video_calls SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    res.json({ message: 'Call status updated' });
  } catch (error) {
    console.error('Update call status error:', error);
    res.status(500).json({ error: 'Failed to update call status' });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = await pool.query(
      `SELECT vc.id, vc.call_type, vc.call_status, vc.started_at, 
              vc.ended_at, vc.duration,
              CASE 
                WHEN vc.caller_id = $1 THEN u2.full_name
                ELSE u1.full_name
              END as partner_name,
              CASE 
                WHEN vc.caller_id = $1 THEN u2.profile_photo
                ELSE u1.profile_photo
              END as partner_photo
       FROM video_calls vc
       JOIN users u1 ON u1.id = vc.caller_id
       JOIN users u2 ON u2.id = vc.receiver_id
       WHERE vc.caller_id = $1 OR vc.receiver_id = $1
       ORDER BY vc.started_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json(history.rows);
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
};

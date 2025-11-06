import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      gender,
      dateOfBirth,
      registrationType,
      caste,
      phone,
      location,
      profilePhoto,
    } = req.body;

    console.log('Registration request received');
    console.log('Email:', email);
    console.log('Full Name:', fullName);
    console.log('Profile Photo received:', profilePhoto ? 'Yes' : 'No');
    if (profilePhoto) {
      console.log('Profile Photo length:', profilePhoto.length);
      console.log('Profile Photo preview:', profilePhoto.substring(0, 50) + '...');
    }

    // Validate required fields
    if (!email || !password || !fullName || !gender || !dateOfBirth || !registrationType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user with profile photo
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, 
       registration_type, caste, phone, location, profile_photo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, email, full_name, gender, registration_type, caste, profile_photo`,
      [email, passwordHash, fullName, gender, dateOfBirth, registrationType, caste, phone, location, profilePhoto || null]
    );

    let user = result.rows[0];

    console.log('User created with ID:', user.id);
    console.log('User profile_photo in INSERT result:', user.profile_photo ? 'Yes' : 'No');
    
    // Fetch user again to ensure we get the full profile_photo
    if (profilePhoto) {
      const userFetch = await pool.query(
        'SELECT id, email, full_name, gender, registration_type, caste, profile_photo FROM users WHERE id = $1',
        [user.id]
      );
      user = userFetch.rows[0];
      console.log('User profile_photo after re-fetch:', user.profile_photo ? 'Yes' : 'No');
      if (user.profile_photo) {
        console.log('Profile photo length after re-fetch:', user.profile_photo.length);
      }
    }

    // If profile photo was uploaded, also add it to profile_photos table
    if (profilePhoto) {
      console.log('Adding photo to profile_photos table...');
      await pool.query(
        `INSERT INTO profile_photos (user_id, photo_url, is_primary) 
         VALUES ($1, $2, true)`,
        [user.id, profilePhoto]
      );
      console.log('Photo added to profile_photos table');
    }

    // Create default preferences
    await pool.query(
      `INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age) 
       VALUES ($1, $2, 18, 50)`,
      [user.id, gender === 'male' ? 'female' : 'male']
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Sending response with user:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      has_profile_photo: user.profile_photo ? 'Yes' : 'No',
      profile_photo_length: user.profile_photo ? user.profile_photo.length : 0
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

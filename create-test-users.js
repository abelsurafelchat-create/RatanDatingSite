import pool from './server/database/db.js';
import bcrypt from 'bcryptjs';

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('test123', salt);

    // Create User 1 - Male, Dating
    const user1 = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, registration_type, location, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, full_name, gender, registration_type`,
      ['male@test.com', passwordHash, 'Raj Kumar', 'male', '1995-01-15', 'dating', 'Mumbai, India', 'Looking for someone special']
    );

    // Create User 2 - Female, Dating
    const user2 = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, registration_type, location, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, full_name, gender, registration_type`,
      ['female@test.com', passwordHash, 'Priya Sharma', 'female', '1997-03-20', 'dating', 'Delhi, India', 'Love to travel and meet new people']
    );

    // Create preferences for both users
    if (user1.rows.length > 0) {
      await pool.query(
        `INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age)
         VALUES ($1, 'female', 20, 35)
         ON CONFLICT (user_id) DO NOTHING`,
        [user1.rows[0].id]
      );
      console.log('✅ Created male user:', user1.rows[0]);
    }

    if (user2.rows.length > 0) {
      await pool.query(
        `INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age)
         VALUES ($1, 'male', 20, 35)
         ON CONFLICT (user_id) DO NOTHING`,
        [user2.rows[0].id]
      );
      console.log('✅ Created female user:', user2.rows[0]);
    }

    console.log('\n✅ Test users created successfully!');
    console.log('\nLogin credentials:');
    console.log('User 1 (Male): male@test.com / test123');
    console.log('User 2 (Female): female@test.com / test123');
    console.log('\nBoth users are set to "dating" mode and will see each other!');

    await pool.end();
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();

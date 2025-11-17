import pool from './server/database/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin functionality...');

    // Add role column if it doesn't exist
    console.log('📝 Adding role column to users table...');
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);

    // Create index for role queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);

    // Update existing users to have 'user' role
    await pool.query(`
      UPDATE users SET role = 'user' WHERE role IS NULL
    `);

    console.log('✅ Database schema updated successfully!');

    // Get the first user to make admin (or specify an email)
    const adminEmail = process.argv[2]; // Pass email as command line argument
    
    if (adminEmail) {
      console.log(`👑 Making ${adminEmail} an admin...`);
      const result = await pool.query(
        'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, full_name, email, role',
        ['admin', adminEmail]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log('✅ Admin user created successfully!');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.full_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
      } else {
        console.log('❌ User not found with that email');
      }
    } else {
      console.log('📋 To make a user admin, run:');
      console.log('   node setup-admin.js user@example.com');
      
      // Show existing users
      const users = await pool.query('SELECT id, full_name, email, role FROM users ORDER BY created_at LIMIT 5');
      console.log('\n👥 Existing users:');
      users.rows.forEach(user => {
        console.log(`   ${user.id}: ${user.full_name} (${user.email}) - ${user.role || 'user'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await pool.end();
  }
}

setupAdmin();

#!/usr/bin/env node

import pool from './server/database/db.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
    try {
        console.log('\n🔐 Create New Admin User\n');
        console.log('This script will create a new user account with admin privileges.\n');

        // Add role column if it doesn't exist
        await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);

        // Get user input
        const email = await question('Enter email address: ');
        const password = await question('Enter password: ');
        const fullName = await question('Enter full name: ');
        const gender = await question('Enter gender (male/female): ');
        const dateOfBirth = await question('Enter date of birth (YYYY-MM-DD): ');
        const registrationType = await question('Enter registration type (dating/matrimony/friendship): ');

        // Validate inputs
        if (!email || !password || !fullName || !gender || !dateOfBirth || !registrationType) {
            console.log('\n❌ All fields are required!');
            rl.close();
            await pool.end();
            return;
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log('\n⚠️  User with this email already exists!');
            const makeAdmin = await question('Do you want to make this user an admin? (yes/no): ');

            if (makeAdmin.toLowerCase() === 'yes' || makeAdmin.toLowerCase() === 'y') {
                const result = await pool.query(
                    'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, full_name, email, role',
                    ['admin', email]
                );

                const user = result.rows[0];
                console.log('\n✅ User updated to admin successfully!');
                console.log(`   ID: ${user.id}`);
                console.log(`   Name: ${user.full_name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
            }
        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Create new user with admin role
            const result = await pool.query(
                `INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, 
         registration_type, role, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, 'admin', true) 
         RETURNING id, email, full_name, gender, registration_type, role`,
                [email, passwordHash, fullName, gender, dateOfBirth, registrationType]
            );

            const user = result.rows[0];

            // Create default preferences
            await pool.query(
                `INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age) 
         VALUES ($1, $2, 18, 50)`,
                [user.id, gender === 'male' ? 'female' : 'male']
            );

            console.log('\n✅ Admin user created successfully!');
            console.log(`   ID: ${user.id}`);
            console.log(`   Name: ${user.full_name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log('\n📝 You can now login with these credentials and access the admin dashboard at /admin');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
        await pool.end();
    }
}

createAdminUser();

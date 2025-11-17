import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Use the consolidated database.sql file from project root
    const schemaPath = join(__dirname, '../../database.sql');
    
    const schema = readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - profile_photos');
    console.log('  - swipes');
    console.log('  - matches');
    console.log('  - messages');
    console.log('  - video_calls');
    console.log('  - user_preferences');
    console.log('  - blocked_users');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();

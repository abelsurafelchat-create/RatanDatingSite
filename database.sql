-- =====================================================
-- IndiDate Database Schema - Complete Setup
-- =====================================================
-- This file contains the complete database schema for the IndiDate application
-- Run this file to create all necessary tables, indexes, and constraints

-- =====================================================
-- MAIN TABLES
-- =====================================================

-- Users table - Core user information
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE NOT NULL,
    registration_type VARCHAR(20) NOT NULL CHECK (registration_type IN ('dating', 'marriage')),
    caste VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(255),
    bio TEXT,
    profile_photo TEXT, -- Changed to TEXT to support Base64 images
    last_seen TIMESTAMP DEFAULT NOW(), -- Added for online status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Profile photos table - Additional user photos
CREATE TABLE IF NOT EXISTS profile_photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL, -- Changed to TEXT to support Base64 images
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swipes table (likes/dislikes)
CREATE TABLE IF NOT EXISTS swipes (
    id SERIAL PRIMARY KEY,
    swiper_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    swiped_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    swipe_type VARCHAR(20) NOT NULL CHECK (swipe_type IN ('like', 'dislike')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_id)
);

-- Matches table (mutual likes)
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

-- Messages table - Enhanced with media support
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- Added for voice/image messages
    media_data TEXT, -- Added for storing media content
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video calls table
CREATE TABLE IF NOT EXISTS video_calls (
    id SERIAL PRIMARY KEY,
    caller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('random', 'matched')),
    call_status VARCHAR(20) NOT NULL CHECK (call_status IN ('pending', 'ongoing', 'completed', 'rejected')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration INTEGER
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_gender VARCHAR(20),
    min_age INTEGER,
    max_age INTEGER,
    preferred_castes TEXT[], -- Array of preferred castes
    max_distance INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_users_registration_type ON users(registration_type);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
CREATE INDEX IF NOT EXISTS idx_users_caste ON users(caste);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Swipes table indexes
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON swipes(swiped_id);

-- Matches table indexes
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- =====================================================
-- DATA MIGRATION AND UPDATES
-- =====================================================

-- Update existing users to have current timestamp for last_seen
UPDATE users 
SET last_seen = NOW() 
WHERE last_seen IS NULL;

-- Update existing messages to have 'text' type
UPDATE messages 
SET message_type = 'text' 
WHERE message_type IS NULL;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment the following section if you want to insert sample data for testing

/*
-- Sample users for testing
INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, registration_type, caste, location, bio) VALUES
('john.doe@example.com', '$2b$10$example_hash_1', 'John Doe', 'male', '1990-05-15', 'dating', 'General', 'Mumbai, India', 'Looking for meaningful connections'),
('jane.smith@example.com', '$2b$10$example_hash_2', 'Jane Smith', 'female', '1992-08-22', 'dating', 'General', 'Delhi, India', 'Love to travel and explore new places'),
('raj.patel@example.com', '$2b$10$example_hash_3', 'Raj Patel', 'male', '1988-12-10', 'marriage', 'Patel', 'Ahmedabad, India', 'Family-oriented person seeking life partner'),
('priya.sharma@example.com', '$2b$10$example_hash_4', 'Priya Sharma', 'female', '1991-03-18', 'marriage', 'Brahmin', 'Bangalore, India', 'Traditional values with modern outlook');

-- Sample user preferences
INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age, preferred_castes) VALUES
(1, 'female', 22, 30, ARRAY['General', 'OBC']),
(2, 'male', 25, 35, ARRAY['General', 'Brahmin']),
(3, 'female', 23, 28, ARRAY['Patel', 'General']),
(4, 'male', 26, 32, ARRAY['Brahmin', 'General']);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment to verify table creation
/*
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check users table structure
\d users;

-- Check messages table structure
\d messages;

-- Count records in each table
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 
    'profile_photos' as table_name, COUNT(*) as record_count FROM profile_photos
UNION ALL
SELECT 
    'swipes' as table_name, COUNT(*) as record_count FROM swipes
UNION ALL
SELECT 
    'matches' as table_name, COUNT(*) as record_count FROM matches
UNION ALL
SELECT 
    'messages' as table_name, COUNT(*) as record_count FROM messages
UNION ALL
SELECT 
    'video_calls' as table_name, COUNT(*) as record_count FROM video_calls
UNION ALL
SELECT 
    'user_preferences' as table_name, COUNT(*) as record_count FROM user_preferences
UNION ALL
SELECT 
    'blocked_users' as table_name, COUNT(*) as record_count FROM blocked_users;
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Database schema setup complete!
-- All tables, indexes, and constraints have been created.
-- The database is ready for the IndiDate application.

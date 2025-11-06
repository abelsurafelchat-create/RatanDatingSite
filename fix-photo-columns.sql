-- Fix photo columns to support Base64 images
-- Run this in your PostgreSQL database

-- Change profile_photo column to TEXT (unlimited length)
ALTER TABLE users ALTER COLUMN profile_photo TYPE TEXT;

-- Change photo_url column in profile_photos to TEXT
ALTER TABLE profile_photos ALTER COLUMN photo_url TYPE TEXT;

-- Verify changes
\d users
\d profile_photos

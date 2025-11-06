-- Test if profile_photo column can store and return Base64 data

-- Check column type
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'profile_photo';

-- Test insert with sample Base64 (small)
-- This is a 1x1 red pixel PNG
INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, registration_type, profile_photo)
VALUES (
  'test_photo@example.com',
  'test_hash',
  'Test Photo User',
  'male',
  '1990-01-01',
  'dating',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
)
RETURNING id, email, full_name, 
  CASE 
    WHEN profile_photo IS NULL THEN 'NULL'
    WHEN profile_photo = '' THEN 'EMPTY'
    ELSE 'HAS_DATA'
  END as photo_status,
  LENGTH(profile_photo) as photo_length;

-- Clean up test
DELETE FROM users WHERE email = 'test_photo@example.com';

import bcrypt from 'bcryptjs';
import pool from './database/db.js';
import axios from 'axios';

// Random Indian names
const maleFirstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Advaith', 'Pranav', 'Dhruv', 'Aryan', 'Kabir', 'Shivansh', 'Reyansh', 'Aadhya'];
const femaleFirstNames = ['Aadhya', 'Saanvi', 'Ananya', 'Diya', 'Aaradhya', 'Pari', 'Anika', 'Navya', 'Angel', 'Pihu', 'Myra', 'Sara', 'Prisha', 'Anvi', 'Riya', 'Avni', 'Kiara', 'Ira', 'Shanaya', 'Kavya'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Joshi', 'Iyer', 'Nair', 'Rao', 'Mehta', 'Desai', 'Kapoor', 'Malhotra', 'Chopra', 'Agarwal', 'Bansal', 'Jain', 'Shah'];

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri', 'Patna', 'Vadodara'];

const castes = ['Brahmin', 'Kshatriya', 'Vaishya', 'Other Backward Class (OBC)', 'Prefer not to say'];

const bios = [
  'Love to travel and explore new places 🌍',
  'Foodie at heart ❤️ Coffee lover ☕',
  'Fitness enthusiast 💪 Gym lover',
  'Music and movies are my passion 🎵🎬',
  'Software engineer by day, gamer by night 🎮',
  'Adventure seeker and nature lover 🏔️',
  'Bookworm 📚 Tea addict 🍵',
  'Yoga and meditation practitioner 🧘',
  'Entrepreneur | Startup enthusiast 🚀',
  'Artist and creative soul 🎨',
  'Sports fanatic | Cricket lover 🏏',
  'Photographer capturing moments 📸',
  'Chef in the making 👨‍🍳',
  'Dance is my therapy 💃',
  'Tech geek | Gadget lover 💻',
  'Fashion enthusiast | Style blogger 👗',
  'Pet lover | Dog parent 🐕',
  'Traveler | 15 countries and counting ✈️',
  'Fitness coach | Healthy lifestyle advocate 🥗',
  'Musician | Guitar player 🎸'
];

// Function to generate random profile photo using placeholder service
async function getRandomPhoto(gender) {
  // Using UI Avatars for random profile pictures
  const seed = Math.random().toString(36).substring(7);
  const name = gender === 'male' 
    ? `${maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]}`
    : `${femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)]}`;
  
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // Generate avatar URL
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=${color}&color=fff&bold=true`;
  
  try {
    const response = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
    return base64;
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
}

// Function to generate random date of birth (18-50 years old)
function getRandomDOB() {
  const today = new Date();
  const minAge = 18;
  const maxAge = 50;
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const year = today.getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Function to create a random user
async function createRandomUser(index) {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = gender === 'male' 
    ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
    : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
  const password = 'password123'; // Default password for all test accounts
  const registrationType = Math.random() > 0.5 ? 'dating' : 'marriage';
  const caste = castes[Math.floor(Math.random() * castes.length)];
  const location = cities[Math.floor(Math.random() * cities.length)];
  const phone = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  const dateOfBirth = getRandomDOB();
  const bio = bios[Math.floor(Math.random() * bios.length)];

  console.log(`Creating user ${index + 1}/100: ${fullName} (${gender})`);

  try {
    // Get random profile photo
    const profilePhoto = await getRandomPhoto(gender);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, gender, date_of_birth, 
       registration_type, caste, phone, location, bio, profile_photo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id`,
      [email, passwordHash, fullName, gender, dateOfBirth, registrationType, caste, phone, location, bio, profilePhoto]
    );

    const userId = result.rows[0].id;

    // Add profile photo to profile_photos table
    if (profilePhoto) {
      await pool.query(
        `INSERT INTO profile_photos (user_id, photo_url, is_primary) 
         VALUES ($1, $2, true)`,
        [userId, profilePhoto]
      );
    }

    // Create default preferences
    await pool.query(
      `INSERT INTO user_preferences (user_id, preferred_gender, min_age, max_age) 
       VALUES ($1, $2, 18, 50)`,
      [userId, gender === 'male' ? 'female' : 'male']
    );

    console.log(`✓ Created user: ${fullName} (ID: ${userId})`);
    return userId;
  } catch (error) {
    console.error(`✗ Error creating user ${fullName}:`, error.message);
    return null;
  }
}

// Main function to seed users
async function seedUsers() {
  console.log('Starting to seed 100 random users...\n');
  
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < 100; i++) {
    const userId = await createRandomUser(i);
    if (userId) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('Seeding complete!');
  console.log('='.repeat(50));
  console.log(`✓ Successfully created: ${successCount} users`);
  console.log(`✗ Failed: ${failCount} users`);
  console.log(`⏱ Time taken: ${duration} seconds`);
  console.log('='.repeat(50));
  console.log('\nDefault password for all accounts: password123');
  
  process.exit(0);
}

// Run the seeder
seedUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

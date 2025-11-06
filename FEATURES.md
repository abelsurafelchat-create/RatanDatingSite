# IndiDate - Feature Documentation

## Core Features

### 1. Dual Registration System

Users can register for either:
- **Dating Mode**: Casual dating and relationships
- **Marriage Mode**: Serious relationships leading to marriage

**Key Points:**
- Users only see profiles from the same mode
- Cannot switch modes after registration (prevents confusion)
- Separate recommendation algorithms for each mode

### 2. Indian Caste System Integration

**Caste Options:**
- Brahmin
- Kshatriya
- Vaishya
- Shudra
- Dalit / Scheduled Caste
- Scheduled Tribe
- Other Backward Class (OBC)
- Prefer not to say
- Other (custom input)

**Features:**
- Optional field (respects user privacy)
- Can be used in preferences for filtering
- Displayed on profile cards
- Searchable and filterable

### 3. Smart Recommendation System

**Matching Algorithm:**
- Same registration type (dating/marriage)
- Opposite gender preference
- Age range filtering
- Location-based suggestions
- Excludes already swiped users
- Excludes blocked users
- Random order for fairness

**Customizable Preferences:**
- Preferred gender
- Age range (min/max)
- Preferred castes (multi-select)
- Maximum distance
- Can be updated anytime

### 4. Swipe Feature (Tinder-style)

**Functionality:**
- Swipe right (❤️) to like
- Swipe left (✖️) to dislike
- Animated card transitions
- Instant match notification on mutual likes
- Automatic match creation
- Profile preview with:
  - Photos
  - Name and age
  - Location
  - Bio
  - Community/caste
  - Registration type

**Match Logic:**
- Both users must like each other
- Creates entry in matches table
- Enables chat functionality
- Notification on match

### 5. LinkedIn-Style Chat Interface

**Design Principles:**
- Professional and clean UI
- Two-column layout (conversations + messages)
- Real-time messaging via Socket.io
- Typing indicators
- Read receipts
- Online status indicators

**Features:**
- Conversation list with:
  - Profile photos
  - Last message preview
  - Timestamp
  - Unread count badge
  - Online status dot
- Message interface with:
  - Scrollable message history
  - Timestamp on each message
  - Sender identification
  - Message bubbles (different colors for sent/received)
  - Input field with send button
- Search conversations
- Only matched users can chat
- Message persistence in database

### 6. Random Video Calling (Omegle-style)

**How It Works:**
1. User clicks "Start Call"
2. System searches for available partner
3. Matches with opposite gender + same registration type
4. WebRTC connection established
5. Video call begins

**Features:**
- Real-time video and audio
- Toggle camera on/off
- Toggle microphone on/off
- End call button
- Skip to next person
- Picture-in-picture local video
- Full-screen remote video
- Call status indicators
- Automatic partner matching
- Queue system for waiting users

**Technical Implementation:**
- WebRTC for peer-to-peer connection
- Socket.io for signaling
- Simple-peer library
- Media stream handling
- Automatic cleanup on disconnect

### 7. Profile Management

**Profile Information:**
- Full name
- Email (unique)
- Phone number
- Date of birth (age calculation)
- Gender
- Location
- Bio/About section
- Caste/Community
- Registration type
- Profile photo
- Additional photos (gallery)

**Editable Fields:**
- All profile information
- Preferences (gender, age range, castes)
- Bio and description
- Location
- Contact information

**Privacy:**
- Email only visible to user
- Phone optional
- Caste optional
- Can hide certain information

### 8. Matches Page

**Display:**
- Grid layout of matched users
- Profile cards with:
  - Photo
  - Name and age
  - Location
  - Bio preview
  - Match date
  - Chat button

**Actions:**
- View match details
- Start conversation
- View match date
- Navigate to chat

### 9. Real-time Features (Socket.io)

**Implemented:**
- Instant messaging
- Typing indicators
- Online/offline status
- Video call signaling
- Match notifications
- Message delivery

**Events:**
- User authentication
- Send/receive messages
- Typing status
- Call matching
- Call signals (WebRTC)
- Call end
- User disconnect

## Security Features

### Authentication
- JWT-based authentication
- Password hashing (bcrypt)
- Token expiration (7 days)
- Secure HTTP headers
- Protected routes

### Database Security
- Parameterized queries (SQL injection prevention)
- Password hashing before storage
- Unique email constraint
- Foreign key constraints
- Indexes for performance

### Privacy
- Users can only message matched users
- Blocked users cannot interact
- Profile visibility controls
- Optional fields (caste, phone)

## User Flow

### New User Journey

1. **Registration**
   - Choose Dating or Marriage
   - Fill personal information
   - Select caste (optional)
   - Set preferences
   - Create account

2. **Profile Setup**
   - Add profile photo
   - Write bio
   - Add additional photos
   - Set preferences

3. **Discovery**
   - View recommendations
   - Swipe on profiles
   - Get matches

4. **Connection**
   - Chat with matches
   - Random video calls
   - Build relationships

5. **Engagement**
   - Update profile
   - Adjust preferences
   - Continue swiping

## Technical Stack

### Frontend
- **React 18**: UI framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **Socket.io Client**: Real-time communication
- **Simple-peer**: WebRTC wrapper
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **TailwindCSS**: Styling
- **date-fns**: Date formatting

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **PostgreSQL**: Database
- **Socket.io**: WebSocket server
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **pg**: PostgreSQL client

### Development
- **Vite**: Build tool
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## Database Schema

### Tables

1. **users**: User accounts and profiles
2. **profile_photos**: Additional user photos
3. **swipes**: Like/dislike records
4. **matches**: Mutual matches
5. **messages**: Chat messages
6. **video_calls**: Call history
7. **user_preferences**: User preferences
8. **blocked_users**: Blocked user relationships

### Relationships
- One-to-many: User → Photos
- One-to-many: User → Swipes
- Many-to-many: Users ↔ Matches
- One-to-many: User → Messages
- One-to-one: User → Preferences

## Performance Optimizations

1. **Database Indexes**
   - User registration type
   - User gender
   - Swipe records
   - Message timestamps

2. **Query Optimization**
   - Parameterized queries
   - Limited result sets
   - Efficient joins
   - Proper indexing

3. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Caching strategies

4. **Real-time Optimization**
   - Socket connection pooling
   - Event debouncing
   - Efficient data transfer

## Future Enhancements

### Phase 2
- [ ] Image upload and storage (AWS S3/Cloudinary)
- [ ] Email verification
- [ ] Password reset
- [ ] Advanced search filters
- [ ] Location-based matching (GPS)

### Phase 3
- [ ] Push notifications
- [ ] In-app notifications
- [ ] User verification badges
- [ ] Report/Block functionality
- [ ] Admin dashboard

### Phase 4
- [ ] Premium features
- [ ] Subscription plans
- [ ] Boost profile visibility
- [ ] See who liked you
- [ ] Unlimited swipes

### Phase 5
- [ ] Mobile apps (iOS/Android)
- [ ] Video profiles
- [ ] Voice messages
- [ ] Story feature
- [ ] Events and meetups

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** Video calling requires WebRTC support and HTTPS in production.

## Accessibility

- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators
- Alt text for images

## Internationalization (Future)

- Multi-language support
- Regional preferences
- Currency localization
- Date/time formats
- Cultural customization

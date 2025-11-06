#!/bin/bash

# IndiDate - cPanel Deployment Build Script
# This script prepares your application for cPanel deployment

echo "🚀 IndiDate - cPanel Deployment Preparation"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous builds
echo -e "${BLUE}Step 1: Cleaning previous builds...${NC}"
rm -rf dist
rm -rf deploy
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build frontend
echo -e "${BLUE}Step 3: Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 4: Prepare deployment folder
echo -e "${BLUE}Step 4: Preparing deployment folder...${NC}"
mkdir -p deploy/frontend
mkdir -p deploy/backend

# Copy frontend files
cp -r dist/* deploy/frontend/

# Copy backend files
cp -r server deploy/backend/
cp package.json deploy/backend/
cp package-lock.json deploy/backend/ 2>/dev/null || :

# Create .env template
cat > deploy/backend/.env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cpanelusername_indidate_db
DB_USER=cpanelusername_indidate_user
DB_PASSWORD=your_database_password

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# CORS
CORS_ORIGIN=https://yourdomain.com

# Session Secret (CHANGE THIS!)
SESSION_SECRET=your_session_secret_here
EOF

echo -e "${GREEN}✓ Deployment folder prepared${NC}"
echo ""

# Step 5: Create .htaccess for frontend
echo -e "${BLUE}Step 5: Creating .htaccess...${NC}"
cat > deploy/frontend/.htaccess << 'EOF'
# Enable RewriteEngine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API Proxy - Forward /api requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/(.*)$ [OR]
RewriteCond %{REQUEST_URI} ^/socket.io/(.*)$
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# SPA Routing - All other requests go to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Enable Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
EOF

echo -e "${GREEN}✓ .htaccess created${NC}"
echo ""

# Step 6: Create README for deployment
cat > deploy/README.md << 'EOF'
# IndiDate - cPanel Deployment Package

## 📦 Contents

- `frontend/` - Built React application (upload to public_html)
- `backend/` - Node.js server files (upload to ~/indidate-backend)

## 🚀 Deployment Steps

### 1. Upload Frontend
- Upload all files from `frontend/` folder to your `public_html` directory
- Make sure `.htaccess` is uploaded

### 2. Upload Backend
- Create folder `indidate-backend` in your home directory
- Upload all files from `backend/` folder to `~/indidate-backend`

### 3. Configure Environment
- Edit `backend/.env` file with your actual values:
  - Database credentials
  - JWT secret
  - Domain name
  - Session secret

### 4. Setup Node.js App in cPanel
- Go to "Setup Node.js App"
- Create application:
  - Application root: `indidate-backend`
  - Application startup file: `server/index.js`
  - Node.js version: 18.x or higher
- Install dependencies (click "Run NPM Install")
- Start application

### 5. Setup Database
- Create PostgreSQL database in cPanel
- Import schema from `backend/server/database/schema.sql`
- Update database credentials in `.env`

### 6. Test
- Visit your domain
- Try registration/login
- Test video call feature

## 📝 Important Notes

- Change JWT_SECRET and SESSION_SECRET in .env
- Enable SSL certificate (Let's Encrypt)
- Check application logs if issues occur
- Monitor resource usage in cPanel

For detailed instructions, see CPANEL_DEPLOYMENT_GUIDE.md
EOF

echo -e "${GREEN}✓ README created${NC}"
echo ""

# Step 7: Create archive
echo -e "${BLUE}Step 6: Creating deployment archive...${NC}"
cd deploy
zip -r ../indidate-cpanel-deployment.zip . > /dev/null 2>&1
cd ..
echo -e "${GREEN}✓ Archive created: indidate-cpanel-deployment.zip${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Deployment package ready!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📦 Files prepared in 'deploy/' folder:"
echo "   - frontend/ (upload to public_html)"
echo "   - backend/ (upload to ~/indidate-backend)"
echo ""
echo "📦 Archive created:"
echo "   - indidate-cpanel-deployment.zip"
echo ""
echo "📖 Next steps:"
echo "   1. Extract the zip file"
echo "   2. Upload frontend files to public_html"
echo "   3. Upload backend files to ~/indidate-backend"
echo "   4. Configure .env file"
echo "   5. Setup Node.js app in cPanel"
echo "   6. Setup PostgreSQL database"
echo ""
echo "📚 See CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""

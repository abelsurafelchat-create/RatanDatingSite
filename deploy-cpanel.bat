@echo off
REM IndiDate - cPanel Deployment Build Script (Windows)
REM This script prepares your application for cPanel deployment

echo ========================================
echo IndiDate - cPanel Deployment Preparation
echo ========================================
echo.

REM Step 1: Clean previous builds
echo Step 1: Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist deploy rmdir /s /q deploy
echo [OK] Cleaned
echo.

REM Step 2: Install dependencies
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Build frontend
echo Step 3: Building frontend...
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
echo [OK] Frontend built successfully
echo.

REM Step 4: Prepare deployment folder
echo Step 4: Preparing deployment folder...
mkdir deploy\frontend
mkdir deploy\backend

REM Copy frontend files
xcopy /s /e /i /q dist deploy\frontend

REM Copy backend files
xcopy /s /e /i /q server deploy\backend\server
copy package.json deploy\backend\
if exist package-lock.json copy package-lock.json deploy\backend\

REM Create .env template
(
echo # Server Configuration
echo NODE_ENV=production
echo PORT=3000
echo FRONTEND_URL=https://yourdomain.com
echo.
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_NAME=cpanelusername_indidate_db
echo DB_USER=cpanelusername_indidate_user
echo DB_PASSWORD=your_database_password
echo.
echo # JWT Secret ^(CHANGE THIS!^)
echo JWT_SECRET=your_super_secret_jwt_key_here_change_this
echo.
echo # CORS
echo CORS_ORIGIN=https://yourdomain.com
echo.
echo # Session Secret ^(CHANGE THIS!^)
echo SESSION_SECRET=your_session_secret_here
) > deploy\backend\.env

echo [OK] Deployment folder prepared
echo.

REM Step 5: Create .htaccess for frontend
echo Step 5: Creating .htaccess...
(
echo # Enable RewriteEngine
echo RewriteEngine On
echo.
echo # Force HTTPS
echo RewriteCond %%{HTTPS} off
echo RewriteRule ^^(.*)$ https://%%{HTTP_HOST}%%{REQUEST_URI} [L,R=301]
echo.
echo # API Proxy - Forward /api requests to Node.js backend
echo RewriteCond %%{REQUEST_URI} ^^/api/(.*)$ [OR]
echo RewriteCond %%{REQUEST_URI} ^^/socket.io/(.*)$
echo RewriteRule ^^(.*)$ http://localhost:3000/$1 [P,L]
echo.
echo # SPA Routing - All other requests go to index.html
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule ^^(.*)$ /index.html [L]
echo.
echo # Enable CORS
echo Header set Access-Control-Allow-Origin "*"
echo Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
echo Header set Access-Control-Allow-Headers "Content-Type, Authorization"
echo.
echo # Enable Gzip Compression
echo ^<IfModule mod_deflate.c^>
echo   AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
echo ^</IfModule^>
echo.
echo # Browser Caching
echo ^<IfModule mod_expires.c^>
echo   ExpiresActive On
echo   ExpiresByType image/jpg "access plus 1 year"
echo   ExpiresByType image/jpeg "access plus 1 year"
echo   ExpiresByType image/gif "access plus 1 year"
echo   ExpiresByType image/png "access plus 1 year"
echo   ExpiresByType text/css "access plus 1 month"
echo   ExpiresByType application/javascript "access plus 1 month"
echo ^</IfModule^>
) > deploy\frontend\.htaccess

echo [OK] .htaccess created
echo.

REM Step 6: Create README
(
echo # IndiDate - cPanel Deployment Package
echo.
echo ## Contents
echo.
echo - frontend/ - Built React application ^(upload to public_html^)
echo - backend/ - Node.js server files ^(upload to ~/indidate-backend^)
echo.
echo ## Deployment Steps
echo.
echo ### 1. Upload Frontend
echo - Upload all files from frontend/ folder to your public_html directory
echo - Make sure .htaccess is uploaded
echo.
echo ### 2. Upload Backend
echo - Create folder indidate-backend in your home directory
echo - Upload all files from backend/ folder to ~/indidate-backend
echo.
echo ### 3. Configure Environment
echo - Edit backend/.env file with your actual values
echo.
echo ### 4. Setup Node.js App in cPanel
echo - Go to "Setup Node.js App"
echo - Create application with Node.js 18.x
echo - Install dependencies
echo - Start application
echo.
echo ### 5. Setup Database
echo - Create PostgreSQL database in cPanel
echo - Import schema from backend/server/database/schema.sql
echo.
echo For detailed instructions, see CPANEL_DEPLOYMENT_GUIDE.md
) > deploy\README.md

echo [OK] README created
echo.

REM Step 7: Create archive (requires PowerShell)
echo Step 6: Creating deployment archive...
powershell -command "Compress-Archive -Path deploy\* -DestinationPath indidate-cpanel-deployment.zip -Force"
if errorlevel 1 (
    echo [WARNING] Could not create zip file. Please zip the deploy folder manually.
) else (
    echo [OK] Archive created: indidate-cpanel-deployment.zip
)
echo.

REM Summary
echo.
echo =========================================
echo [SUCCESS] Deployment package ready!
echo =========================================
echo.
echo Files prepared in 'deploy' folder:
echo    - frontend/ ^(upload to public_html^)
echo    - backend/ ^(upload to ~/indidate-backend^)
echo.
if exist indidate-cpanel-deployment.zip (
    echo Archive created:
    echo    - indidate-cpanel-deployment.zip
    echo.
)
echo Next steps:
echo    1. Extract the zip file ^(or use deploy folder^)
echo    2. Upload frontend files to public_html
echo    3. Upload backend files to ~/indidate-backend
echo    4. Configure .env file
echo    5. Setup Node.js app in cPanel
echo    6. Setup PostgreSQL database
echo.
echo See CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause

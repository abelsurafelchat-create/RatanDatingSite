# 🚀 AWS Deployment Guide for IndiDate

## Prerequisites

Before starting, ensure you have:
- AWS Account (create at https://aws.amazon.com)
- AWS CLI installed
- Domain name (optional but recommended)
- Credit card for AWS billing

---

## Phase 1: Database Setup (RDS PostgreSQL)

### Step 1: Create RDS PostgreSQL Instance

1. **Go to AWS Console → RDS**
2. **Click "Create database"**
3. **Choose settings:**
   - Engine: PostgreSQL 15
   - Template: Free tier (or Production for real deployment)
   - DB instance identifier: `indidate-db`
   - Master username: `postgres`
   - Master password: `[create strong password]`
   - DB instance class: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB
   - Enable storage autoscaling
   - VPC: Default VPC
   - Public access: **Yes** (for initial setup)
   - VPC security group: Create new → `indidate-db-sg`
   - Database name: `indidate`

4. **Click "Create database"**
5. **Wait 5-10 minutes for creation**

### Step 2: Configure Security Group

1. Go to **EC2 → Security Groups**
2. Find `indidate-db-sg`
3. **Edit inbound rules:**
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your IP (for testing)
   - Source: EC2 security group (add later)

### Step 3: Get Database Endpoint

1. Go to **RDS → Databases → indidate-db**
2. Copy the **Endpoint** (e.g., `indidate-db.xxxxx.us-east-1.rds.amazonaws.com`)
3. Save this for later

### Step 4: Import Database Schema

```bash
# Install PostgreSQL client if not installed
# On Windows: Download from https://www.postgresql.org/download/windows/

# Connect to RDS database
psql -h indidate-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d indidate

# Run your schema files
\i server/database/schema.sql
\i add-last-seen-column.sql
\i add-media-messages.sql
```

---

## Phase 2: Media Storage (S3)

### Step 1: Create S3 Bucket for Media

1. **Go to AWS Console → S3**
2. **Click "Create bucket"**
3. **Settings:**
   - Bucket name: `indidate-media-[your-unique-id]`
   - Region: us-east-1 (or your preferred region)
   - Block all public access: **Uncheck** (we need public read)
   - Bucket Versioning: Enable
   - Default encryption: Enable

4. **Click "Create bucket"**

### Step 2: Configure Bucket Policy

1. Go to bucket → **Permissions** → **Bucket Policy**
2. Add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::indidate-media-[your-unique-id]/*"
    }
  ]
}
```

### Step 3: Configure CORS

1. Go to bucket → **Permissions** → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Step 4: Create IAM User for S3 Access

1. **Go to IAM → Users → Create user**
2. **Username:** `indidate-s3-user`
3. **Attach policies:**
   - AmazonS3FullAccess (or create custom policy for specific bucket)
4. **Create access key:**
   - Use case: Application running outside AWS
   - Save Access Key ID and Secret Access Key

---

## Phase 3: Backend Deployment (EC2)

### Step 1: Launch EC2 Instance

1. **Go to AWS Console → EC2 → Launch Instance**
2. **Settings:**
   - Name: `indidate-server`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: `t2.micro` (free tier) or `t2.small`
   - Key pair: Create new → `indidate-key.pem` (download and save)
   - Network: Default VPC
   - Security group: Create new → `indidate-server-sg`
   - Storage: 20 GB gp3

3. **Configure Security Group Rules:**
   - SSH (22): Your IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom TCP (3001): 0.0.0.0/0 (API)
   - Custom TCP (5173): 0.0.0.0/0 (Vite dev - remove in production)

4. **Launch instance**

### Step 2: Connect to EC2

```bash
# On Windows, use Git Bash or WSL
chmod 400 indidate-key.pem
ssh -i indidate-key.pem ubuntu@[EC2-PUBLIC-IP]
```

### Step 3: Install Dependencies on EC2

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 4: Deploy Backend Code

```bash
# Clone your repository (or upload files)
git clone [your-repo-url] /home/ubuntu/indidate
cd /home/ubuntu/indidate

# Or upload files using SCP:
# scp -i indidate-key.pem -r c:/Users/Admin/Downloads/indidate ubuntu@[EC2-IP]:/home/ubuntu/

# Install dependencies
npm install --production

# Create .env file
nano .env
```

**Add to .env:**
```env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=indidate-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=indidate
DB_USER=postgres
DB_PASSWORD=[your-rds-password]

# JWT
JWT_SECRET=[generate-random-secret]

# AWS S3
AWS_ACCESS_KEY_ID=[your-access-key]
AWS_SECRET_ACCESS_KEY=[your-secret-key]
AWS_REGION=us-east-1
AWS_S3_BUCKET=indidate-media-[your-unique-id]

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Step 5: Start Backend with PM2

```bash
# Start server
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs
```

### Step 6: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/indidate
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Or use EC2 IP

    # API routes
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/indidate /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Phase 4: Frontend Deployment (S3 + CloudFront)

### Step 1: Build Frontend

**On your local machine:**

```bash
cd c:/Users/Admin/Downloads/indidate

# Update API URL in your code
# Edit src/config.js or wherever you have API URL
```

Create `src/config.js`:
```javascript
export const API_URL = 'http://[EC2-PUBLIC-IP]:3001';
// Or use your domain: 'https://api.yourdomain.com'
```

Update your axios/socket.io connections to use this URL.

```bash
# Build frontend
npm run build

# This creates a 'dist' folder
```

### Step 2: Create S3 Bucket for Frontend

1. **Go to S3 → Create bucket**
2. **Settings:**
   - Bucket name: `indidate-frontend-[unique-id]`
   - Region: us-east-1
   - Block all public access: **Uncheck**
   - Static website hosting: **Enable**
   - Index document: `index.html`
   - Error document: `index.html`

### Step 3: Upload Frontend Files

```bash
# Install AWS CLI if not installed
# Download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: us-east-1
# Output format: json

# Upload dist folder to S3
aws s3 sync dist/ s3://indidate-frontend-[unique-id]/ --delete
```

### Step 4: Set Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::indidate-frontend-[unique-id]/*"
    }
  ]
}
```

### Step 5: Create CloudFront Distribution (Optional but Recommended)

1. **Go to CloudFront → Create Distribution**
2. **Settings:**
   - Origin domain: Select your S3 bucket
   - Origin access: Public
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Cache policy: CachingOptimized
   - Default root object: `index.html`

3. **Create distribution**
4. **Wait 10-15 minutes for deployment**
5. **Copy CloudFront domain name**

---

## Phase 5: Domain Setup (Optional)

### Step 1: Route 53

1. **Go to Route 53 → Hosted zones**
2. **Create hosted zone** for your domain
3. **Create records:**
   - **A record** for `yourdomain.com` → CloudFront distribution
   - **A record** for `api.yourdomain.com` → EC2 IP
   - **CNAME** for `www.yourdomain.com` → CloudFront distribution

### Step 2: SSL Certificate (Let's Encrypt)

**On EC2:**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Phase 6: Environment Variables Update

### Update Frontend Config

**src/config.js:**
```javascript
export const API_URL = import.meta.env.PROD 
  ? 'https://api.yourdomain.com'  // Production
  : 'http://localhost:3001';       // Development

export const SOCKET_URL = import.meta.env.PROD
  ? 'https://api.yourdomain.com'
  : 'http://localhost:3001';
```

### Rebuild and Redeploy

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://indidate-frontend-[unique-id]/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"
```

---

## 📊 Cost Estimate (Monthly)

**Free Tier (First 12 months):**
- EC2 t2.micro: Free
- RDS db.t3.micro: Free (750 hours)
- S3: 5GB free
- CloudFront: 50GB free
- **Total: ~$0-5/month**

**After Free Tier:**
- EC2 t2.small: ~$17/month
- RDS db.t3.small: ~$25/month
- S3: ~$1-5/month (depending on usage)
- CloudFront: ~$1-10/month
- **Total: ~$45-60/month**

---

## 🔧 Maintenance Commands

### Update Backend Code

```bash
# SSH to EC2
ssh -i indidate-key.pem ubuntu@[EC2-IP]

# Pull latest code
cd /home/ubuntu/indidate
git pull

# Install dependencies
npm install --production

# Restart server
pm2 restart all

# Check logs
pm2 logs
```

### Update Frontend

```bash
# Local machine
npm run build
aws s3 sync dist/ s3://indidate-frontend-[unique-id]/ --delete
aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"
```

### Database Backup

```bash
# Backup
pg_dump -h [RDS-ENDPOINT] -U postgres -d indidate > backup.sql

# Restore
psql -h [RDS-ENDPOINT] -U postgres -d indidate < backup.sql
```

---

## 🚨 Troubleshooting

### Backend not accessible
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

### Database connection issues
```bash
# Test connection
psql -h [RDS-ENDPOINT] -U postgres -d indidate

# Check security group allows EC2 IP
```

### Frontend not loading
```bash
# Check S3 bucket policy
# Check CloudFront distribution status
# Check browser console for CORS errors
```

---

## 📝 Next Steps

1. ✅ Set up monitoring (CloudWatch)
2. ✅ Configure auto-scaling
3. ✅ Set up CI/CD pipeline (GitHub Actions)
4. ✅ Enable RDS backups
5. ✅ Set up CloudWatch alarms
6. ✅ Configure WAF for security

---

## 🎉 Your App is Live!

**Frontend:** https://[cloudfront-domain].cloudfront.net  
**API:** http://[ec2-ip]:3001/api  
**With Domain:** https://yourdomain.com

---

Need help? Check AWS documentation or contact AWS support!

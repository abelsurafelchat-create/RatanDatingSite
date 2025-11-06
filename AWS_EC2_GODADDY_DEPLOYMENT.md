# IndiDate - AWS EC2 + GoDaddy Domain Deployment Guide

## 🚀 Complete Deployment in 2 Hours

**Cost:** ~$50-60/month (or $10-15 with free tier)

---

## 📋 Part 1: Setup RDS Database (20 min)

### Create PostgreSQL Database

1. AWS Console → **RDS** → **Create database**
2. Configure:
   - Engine: PostgreSQL 15.x
   - Template: Free tier
   - DB identifier: `indidate-db`
   - Master username: `postgres`
   - Password: [create strong password]
   - Instance: db.t3.micro
   - Storage: 20 GB
   - Public access: Yes
   - Initial database: `indidate`

3. Wait 10 minutes, note **Endpoint**

### Import Schema

```bash
# On your computer
psql -h indidate-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d indidate
# Paste contents of server/database/schema.sql
\q
```

---

## 🖥️ Part 2: Setup EC2 Instance (30 min)

### Launch Instance

1. AWS Console → **EC2** → **Launch instance**
2. Configure:
   - Name: `indidate-server`
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.small (or t2.micro for free tier)
   - Key pair: Create new → `indidate-key` → Download .pem
   - Security group: Create new
     - SSH (22) - My IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
   - Storage: 30 GB

3. Note **Public IP**

### Connect to EC2

```bash
# Windows
ssh -i indidate-key.pem ubuntu@YOUR-EC2-IP

# Install software
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx postgresql-client
sudo npm install -g pm2
```

---

## 📁 Part 3: Deploy Backend (20 min)

### Upload Files

```bash
# Create directory
sudo mkdir -p /var/www/indidate
sudo chown ubuntu:ubuntu /var/www/indidate
cd /var/www/indidate

# Upload via WinSCP or SCP:
# - server/ folder
# - package.json
```

### Configure Environment

```bash
nano .env
```

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://YOUR-EC2-IP
DB_HOST=indidate-db.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=indidate
DB_USER=postgres
DB_PASSWORD=your_rds_password
JWT_SECRET=generate_random_32_char_string
CORS_ORIGIN=http://YOUR-EC2-IP
SESSION_SECRET=generate_another_random_string
```

### Start Application

```bash
npm install --production
pm2 start server/index.js --name indidate-backend
pm2 save
pm2 startup  # Run the command it shows
```

---

## 🌐 Part 4: Deploy Frontend (15 min)

### Build Locally

```bash
# On your computer
# Update API URL to: http://YOUR-EC2-IP/api
npm run build
# Upload dist/ folder to /var/www/indidate/frontend/
```

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/indidate
```

```nginx
server {
    listen 80;
    server_name YOUR-EC2-IP;

    location / {
        root /var/www/indidate/frontend;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/indidate /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**Test:** Visit `http://YOUR-EC2-IP`

---

## 🌍 Part 5: Connect GoDaddy Domain (15 min)

### Configure DNS

1. **GoDaddy** → My Products → Your Domain → **DNS**
2. Add/Edit A Records:
   ```
   Type: A
   Name: @
   Value: YOUR-EC2-IP
   TTL: 600
   
   Type: A
   Name: www
   Value: YOUR-EC2-IP
   TTL: 600
   ```
3. Wait 10-30 minutes for propagation

### Update Nginx

```bash
sudo nano /etc/nginx/sites-available/indidate
# Change: server_name yourdomain.com www.yourdomain.com;
sudo systemctl restart nginx
```

### Update Environment

```bash
nano .env
# Update: FRONTEND_URL=http://yourdomain.com
# Update: CORS_ORIGIN=http://yourdomain.com
pm2 restart indidate-backend
```

### Rebuild Frontend

```bash
# Update API URL to: http://yourdomain.com/api
npm run build
# Upload new dist/ folder
```

---

## 🔒 Part 6: Setup SSL (10 min)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Choose: Redirect HTTP to HTTPS (option 2)

# Update .env
nano .env
# Change to: FRONTEND_URL=https://yourdomain.com
# Change to: CORS_ORIGIN=https://yourdomain.com
pm2 restart indidate-backend

# Rebuild frontend with HTTPS URLs
# Upload new dist/ folder
```

**Test:** Visit `https://yourdomain.com`

---

## ✅ Testing Checklist

- [ ] Landing page loads (HTTPS)
- [ ] Can register
- [ ] Can login
- [ ] Profile photo upload works
- [ ] Can view matches
- [ ] Can send messages
- [ ] Video call works

---

## 🔧 Useful Commands

```bash
# View logs
pm2 logs indidate-backend
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart indidate-backend
sudo systemctl restart nginx

# Update app
cd /var/www/indidate
git pull  # or upload new files
npm install --production
pm2 restart indidate-backend

# Backup database
pg_dump -h RDS-ENDPOINT -U postgres indidate > backup.sql

# Monitor resources
pm2 status
df -h
free -h
```

---

## 🚨 Troubleshooting

**Can't connect to EC2:**
- Check security group allows SSH from your IP
- Verify key permissions: `chmod 400 indidate-key.pem`

**502 Bad Gateway:**
```bash
pm2 logs indidate-backend
sudo nginx -t
pm2 restart indidate-backend
```

**Database connection error:**
- Update RDS security group to allow EC2 security group
- Verify credentials in .env

**SSL issues:**
```bash
sudo certbot renew
sudo systemctl restart nginx
```

---

## 💰 Monthly Costs

| Service | Free Tier | Production |
|---------|-----------|------------|
| EC2 t2.micro | FREE | - |
| EC2 t3.small | - | $15-20 |
| RDS db.t3.micro | FREE | $15-20 |
| Storage | FREE (30GB) | $3 |
| Data Transfer | FREE (15GB) | $9 |
| **Total** | **$0-10** | **$50-60** |

---

**🎉 Your IndiDate app is now live on AWS with your GoDaddy domain!**

For support: Check AWS documentation or PM2/Nginx logs.

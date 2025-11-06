# Deployment Guide - IndiDate

## Production Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Prepare the application**

Create `Procfile` in root:
```
web: node server/index.js
```

2. **Create Heroku app**
```bash
heroku create indidate-app
```

3. **Add PostgreSQL addon**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set environment variables**
```bash
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://indidate-app.herokuapp.com
```

5. **Deploy**
```bash
git push heroku main
```

6. **Initialize database**
```bash
heroku run node server/database/init.js
```

### Option 2: DigitalOcean/AWS/Azure

#### Server Setup (Ubuntu 20.04)

1. **Update system**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Install PostgreSQL**
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

4. **Setup PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE indidate;
CREATE USER indidate_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE indidate TO indidate_user;
\q
```

5. **Install Nginx**
```bash
sudo apt install nginx -y
```

6. **Clone and setup application**
```bash
cd /var/www
git clone your-repo-url indidate
cd indidate
npm install
```

7. **Create .env file**
```bash
nano .env
```

Add:
```env
DATABASE_URL=postgresql://indidate_user:secure_password@localhost:5432/indidate
JWT_SECRET=your_very_secure_random_string
PORT=3001
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
```

8. **Initialize database**
```bash
node server/database/init.js
```

9. **Build frontend**
```bash
npm run build
```

10. **Setup PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start server/index.js --name indidate
pm2 startup
pm2 save
```

11. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/indidate
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/indidate/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

12. **Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/indidate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

13. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure environment variables** in Vercel dashboard

#### Backend on Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Set environment variables
6. Deploy

### Option 4: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["node", "server/index.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: indidate
      POSTGRES_USER: indidate_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://indidate_user:secure_password@postgres:5432/indidate
      JWT_SECRET: your_jwt_secret
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### Deploy

```bash
docker-compose up -d
```

## Environment Variables for Production

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Security
JWT_SECRET=very_long_random_string_minimum_32_characters

# Server
PORT=3001
NODE_ENV=production

# CORS
CLIENT_URL=https://yourdomain.com

# Optional: Email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: File storage
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_BUCKET_NAME=your_bucket
```

## Pre-Deployment Checklist

- [ ] Update all dependencies
- [ ] Run security audit: `npm audit`
- [ ] Test all features locally
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Configure CORS properly
- [ ] Setup SSL certificate
- [ ] Enable rate limiting
- [ ] Setup database backups
- [ ] Configure monitoring (UptimeRobot)
- [ ] Setup CDN for static assets
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Setup analytics (Google Analytics)
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Test on multiple devices
- [ ] Test video calling with HTTPS

## Post-Deployment

### Monitoring

1. **Setup Application Monitoring**
   - Use PM2 monitoring
   - Setup error tracking (Sentry)
   - Monitor server resources

2. **Database Monitoring**
   - Regular backups
   - Monitor query performance
   - Check disk space

3. **User Monitoring**
   - Google Analytics
   - User feedback system
   - Error reporting

### Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Security patches immediately
   - Feature updates quarterly

2. **Database Maintenance**
   - Regular backups (daily)
   - Optimize queries
   - Clean old data

3. **Performance Optimization**
   - Monitor load times
   - Optimize images
   - Cache static assets
   - CDN for media files

## Scaling Strategies

### Vertical Scaling
- Upgrade server resources
- Increase database capacity
- More RAM/CPU

### Horizontal Scaling
- Load balancer (Nginx)
- Multiple app instances
- Database replication
- Redis for caching
- Message queue (RabbitMQ)

### Database Scaling
- Read replicas
- Connection pooling
- Query optimization
- Partitioning

## Security Best Practices

1. **Server Security**
   - Keep system updated
   - Configure firewall
   - Disable root login
   - Use SSH keys
   - Regular security audits

2. **Application Security**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Rate limiting
   - Helmet.js for headers

3. **Database Security**
   - Strong passwords
   - Limited user permissions
   - Encrypted connections
   - Regular backups
   - Access logs

4. **SSL/TLS**
   - Force HTTPS
   - HSTS headers
   - Secure cookies
   - Certificate renewal

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U indidate_user indidate > /backups/indidate_$DATE.sql
# Keep only last 30 days
find /backups -name "indidate_*.sql" -mtime +30 -delete
```

### File Backups
- User uploads
- Configuration files
- SSL certificates

### Backup Storage
- Local backups
- Cloud storage (S3, Google Cloud)
- Off-site backups

## Troubleshooting Production Issues

### Application Won't Start
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Check database connection
4. Verify port availability

### Database Connection Issues
1. Check PostgreSQL status
2. Verify credentials
3. Check firewall rules
4. Test connection string

### High Memory Usage
1. Check for memory leaks
2. Optimize queries
3. Implement caching
4. Restart application

### Slow Performance
1. Enable query logging
2. Optimize database indexes
3. Implement caching
4. Use CDN for assets
5. Optimize images

## Cost Optimization

### Free Tier Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway (free tier), Render
- **Database**: Railway PostgreSQL, Supabase
- **Storage**: Cloudinary (free tier)

### Budget Options ($10-50/month)
- **Server**: DigitalOcean Droplet ($6/month)
- **Database**: Managed PostgreSQL ($15/month)
- **Storage**: AWS S3 ($5/month)
- **CDN**: Cloudflare (free)

### Production Scale ($100+/month)
- **Server**: Multiple instances
- **Database**: High-availability setup
- **Storage**: Dedicated storage
- **Monitoring**: Premium tools
- **Support**: 24/7 support

## Support and Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Weekly: Monitor performance
- [ ] Monthly: Update dependencies
- [ ] Monthly: Database optimization
- [ ] Quarterly: Security audit
- [ ] Yearly: Infrastructure review

### Emergency Contacts
- Server provider support
- Database administrator
- Development team
- Security team

## Legal Requirements

- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Cookie Policy
- [ ] GDPR Compliance (if EU users)
- [ ] Data Protection
- [ ] Age verification (18+)
- [ ] Content moderation policy

## Launch Checklist

- [ ] All features tested
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Email service setup
- [ ] Analytics installed
- [ ] Error tracking enabled
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Legal pages created
- [ ] Social media accounts
- [ ] Marketing materials
- [ ] Support system ready

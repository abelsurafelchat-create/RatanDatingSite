# ✅ AWS Deployment Checklist for IndiDate

## Pre-Deployment Checklist

### 1. AWS Account Setup
- [ ] Create AWS account
- [ ] Add payment method
- [ ] Verify email
- [ ] Enable MFA (Multi-Factor Authentication)

### 2. Local Preparation
- [ ] Install AWS CLI
- [ ] Install Node.js 18+
- [ ] Test app locally
- [ ] Create production .env file
- [ ] Update API URLs in code

### 3. Code Preparation
- [ ] Review and update `src/config.js`
- [ ] Test build: `npm run build`
- [ ] Check for hardcoded localhost URLs
- [ ] Update CORS origins
- [ ] Review security settings

---

## Deployment Steps

### Phase 1: Database (RDS PostgreSQL)
- [ ] Create RDS instance
- [ ] Configure security group
- [ ] Note down endpoint
- [ ] Import database schema
- [ ] Test connection
- [ ] Create database backup

**Estimated Time:** 15-20 minutes

### Phase 2: Media Storage (S3)
- [ ] Create S3 bucket for media
- [ ] Configure bucket policy
- [ ] Set up CORS
- [ ] Create IAM user
- [ ] Generate access keys
- [ ] Test file upload

**Estimated Time:** 10-15 minutes

### Phase 3: Backend (EC2)
- [ ] Launch EC2 instance
- [ ] Configure security group
- [ ] Connect via SSH
- [ ] Install Node.js
- [ ] Install PM2
- [ ] Install Nginx
- [ ] Upload backend code
- [ ] Create .env file
- [ ] Start server with PM2
- [ ] Configure Nginx
- [ ] Test API endpoints

**Estimated Time:** 30-45 minutes

### Phase 4: Frontend (S3 + CloudFront)
- [ ] Create S3 bucket for frontend
- [ ] Enable static website hosting
- [ ] Build frontend
- [ ] Upload to S3
- [ ] Set bucket policy
- [ ] Create CloudFront distribution
- [ ] Test frontend access

**Estimated Time:** 20-30 minutes

### Phase 5: Domain & SSL (Optional)
- [ ] Purchase domain
- [ ] Create Route 53 hosted zone
- [ ] Update nameservers
- [ ] Create DNS records
- [ ] Install SSL certificate
- [ ] Test HTTPS access

**Estimated Time:** 30-60 minutes

---

## Post-Deployment Checklist

### Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test profile updates
- [ ] Test photo uploads
- [ ] Test messaging
- [ ] Test voice messages
- [ ] Test random video calls
- [ ] Test on mobile devices
- [ ] Test on different browsers

### Monitoring
- [ ] Set up CloudWatch alarms
- [ ] Configure log monitoring
- [ ] Set up error tracking
- [ ] Monitor costs
- [ ] Set billing alerts

### Security
- [ ] Review security groups
- [ ] Enable RDS encryption
- [ ] Enable S3 encryption
- [ ] Review IAM policies
- [ ] Enable AWS WAF (optional)
- [ ] Set up backups

### Documentation
- [ ] Document all AWS resources
- [ ] Save all credentials securely
- [ ] Create runbook for common tasks
- [ ] Document deployment process

---

## Quick Reference

### Important URLs
```
Frontend: https://[cloudfront-domain].cloudfront.net
API: http://[ec2-ip]:3001/api
Database: [rds-endpoint]:5432
Media Bucket: https://[bucket-name].s3.amazonaws.com
```

### Important Commands

**SSH to EC2:**
```bash
ssh -i indidate-key.pem ubuntu@[EC2-IP]
```

**Check Backend Status:**
```bash
pm2 status
pm2 logs
```

**Restart Backend:**
```bash
pm2 restart all
```

**Deploy Frontend:**
```bash
npm run build
aws s3 sync dist/ s3://[bucket-name]/ --delete
```

**Database Backup:**
```bash
pg_dump -h [RDS-ENDPOINT] -U postgres -d indidate > backup.sql
```

---

## Cost Optimization Tips

1. **Use Free Tier:**
   - t2.micro EC2 (750 hours/month)
   - db.t3.micro RDS (750 hours/month)
   - 5GB S3 storage
   - 50GB CloudFront transfer

2. **Stop Resources When Not Needed:**
   - Stop EC2 during development
   - Use RDS snapshots instead of running instance

3. **Monitor Usage:**
   - Set up billing alerts
   - Review Cost Explorer monthly
   - Delete unused resources

4. **Optimize:**
   - Use CloudFront caching
   - Compress images before upload
   - Use S3 lifecycle policies

---

## Troubleshooting

### Frontend Issues
**Problem:** White screen after deployment
- Check browser console for errors
- Verify API URL in config.js
- Check CORS settings
- Verify CloudFront distribution status

**Problem:** Assets not loading
- Check S3 bucket policy
- Verify CloudFront cache
- Check file paths in build

### Backend Issues
**Problem:** API not responding
- Check PM2 status: `pm2 status`
- Check logs: `pm2 logs`
- Verify security group allows port 3001
- Check Nginx configuration

**Problem:** Database connection failed
- Verify RDS endpoint
- Check security group allows EC2 IP
- Verify credentials in .env
- Test connection: `psql -h [endpoint] -U postgres`

### Video Call Issues
**Problem:** WebRTC not connecting
- Check STUN/TURN server configuration
- Verify Socket.io connection
- Check firewall rules
- Test on different networks

---

## Support Resources

- **AWS Documentation:** https://docs.aws.amazon.com
- **AWS Support:** https://console.aws.amazon.com/support
- **AWS Forums:** https://forums.aws.amazon.com
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/amazon-web-services

---

## Emergency Contacts

- AWS Support: [Your support plan]
- Database Admin: [Contact]
- DevOps Team: [Contact]

---

## Backup & Recovery

### Daily Backups
- RDS automated backups (enabled by default)
- S3 versioning (enabled)

### Manual Backup
```bash
# Database
pg_dump -h [RDS-ENDPOINT] -U postgres -d indidate > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://indidate-backups/
```

### Recovery
```bash
# Restore database
psql -h [RDS-ENDPOINT] -U postgres -d indidate < backup.sql

# Restore S3 files
aws s3 sync s3://indidate-backups/ ./restore/
```

---

## Next Steps After Deployment

1. **Set up CI/CD:**
   - GitHub Actions
   - Automatic deployments
   - Automated testing

2. **Monitoring:**
   - Application Performance Monitoring (APM)
   - Error tracking (Sentry)
   - User analytics

3. **Scaling:**
   - Auto-scaling groups
   - Load balancer
   - Read replicas for database

4. **Security:**
   - Regular security audits
   - Penetration testing
   - Compliance checks

---

## 🎉 Congratulations!

Your IndiDate app is now live on AWS!

**Remember:**
- Monitor costs regularly
- Keep backups updated
- Review security settings
- Update dependencies
- Monitor performance

**Good luck with your dating app! 💕**

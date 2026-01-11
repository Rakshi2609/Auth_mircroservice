# Deployment Guide - Universal Auth System

## 🌐 Production Deployment

This guide covers deploying Universal Auth to production environments.

## Prerequisites

- Domain name (for frontend)
- MongoDB Atlas account (or self-hosted MongoDB)
- Email service (SendGrid, AWS SES, or Gmail)
- Hosting platform account

---

## Option 1: Deploy to Heroku (Easiest)

### Backend Deployment

1. **Install Heroku CLI**
```bash
# Windows (using Chocolatey)
choco install heroku-cli

# Mac
brew tap heroku/brew && brew install heroku

# Or download from heroku.com
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create your-auth-api
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-random-secret-key
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set EMAIL_HOST=smtp.sendgrid.net
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=apikey
heroku config:set EMAIL_PASS=your-sendgrid-api-key
heroku config:set CLIENT_URL=https://your-frontend.vercel.app
```

5. **Deploy**
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

6. **Verify**
```bash
heroku open
# Visit: https://your-auth-api.herokuapp.com/health
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Navigate to client folder**
```bash
cd client
```

3. **Update API URL**
Create `client/.env.production`:
```env
VITE_API_URL=https://your-auth-api.herokuapp.com
```

4. **Deploy**
```bash
vercel --prod
```

5. **Configure Domain** (in Vercel dashboard)
- Add your custom domain
- Update DNS settings

---

## Option 2: Deploy to AWS

### Backend (AWS Elastic Beanstalk)

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize**
```bash
eb init -p node.js universal-auth
```

3. **Create Environment**
```bash
eb create production
```

4. **Set Environment Variables**
```bash
eb setenv NODE_ENV=production \
  JWT_SECRET=your-secret \
  MONGODB_URI=your-mongo-uri \
  EMAIL_HOST=email-smtp.us-east-1.amazonaws.com \
  EMAIL_PORT=587 \
  EMAIL_USER=your-ses-user \
  EMAIL_PASS=your-ses-password
```

5. **Deploy**
```bash
eb deploy
```

### Frontend (AWS S3 + CloudFront)

1. **Build Frontend**
```bash
cd client
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://your-auth-frontend
```

3. **Upload Build**
```bash
aws s3 sync dist/ s3://your-auth-frontend
```

4. **Configure S3 for Static Hosting**
```bash
aws s3 website s3://your-auth-frontend \
  --index-document index.html \
  --error-document index.html
```

5. **Setup CloudFront** (via AWS Console)
- Create distribution
- Set origin to S3 bucket
- Configure SSL certificate

---

## Option 3: Deploy to DigitalOcean

### Using App Platform

1. **Connect GitHub Repository**
- Go to DigitalOcean App Platform
- Connect your GitHub account
- Select repository

2. **Configure Backend App**
```yaml
name: universal-auth-backend
services:
  - name: api
    source_dir: /
    environment_slug: node-js
    build_command: npm install
    run_command: node server.js
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "8080"
      - key: MONGODB_URI
        value: ${MONGODB_URI}
    http_port: 8080
```

3. **Configure Frontend App**
```yaml
name: universal-auth-frontend
static_sites:
  - name: web
    source_dir: /client
    build_command: npm install && npm run build
    output_dir: dist
    envs:
      - key: VITE_API_URL
        value: ${api.PUBLIC_URL}
```

4. **Add MongoDB Managed Database**
- Create MongoDB cluster in DigitalOcean
- Copy connection string
- Add as environment variable

---

## MongoDB Atlas Setup

1. **Create Account**
- Go to mongodb.com/atlas
- Sign up for free tier

2. **Create Cluster**
- Choose cloud provider
- Select region (closest to your app)
- M0 tier is free

3. **Configure Network Access**
- IP Whitelist: Add `0.0.0.0/0` (allow all) for initial setup
- Later, restrict to your server IPs

4. **Create Database User**
- Username: `authAdmin`
- Password: Generate strong password
- Role: `readWrite` on your database

5. **Get Connection String**
```
mongodb+srv://authAdmin:<password>@cluster0.xxxxx.mongodb.net/universal-auth?retryWrites=true&w=majority
```

---

## Email Service Setup

### Option 1: SendGrid

1. **Create Account** - sendgrid.com
2. **Verify Sender Identity**
3. **Create API Key**
4. **Use in Environment**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxx
```

### Option 2: AWS SES

1. **Verify Email/Domain** in AWS SES
2. **Create SMTP Credentials**
3. **Use in Environment**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=AKIAXXXXXXXXXXXXXXXX
EMAIL_PASS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 3: Gmail (Not Recommended for Production)

1. **Enable 2FA** on Google Account
2. **Create App Password**
3. **Use in Environment**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Using Cloudflare (Free)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Automatic SSL certificate

---

## Environment Variables Checklist

```env
# ✅ Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=xxxxxxxxxxxxx
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxx
CLIENT_URL=https://your-domain.com

# ✅ Optional
OTP_EXPIRES_IN=10
OTP_LENGTH=6
JWT_EXPIRES_IN=7d
```

---

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] API keys rotated from defaults
- [ ] MongoDB network access restricted

### Monitoring
- [ ] Health endpoint accessible
- [ ] Error logging configured
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring
- [ ] Email delivery monitoring

### Testing
- [ ] Test OTP send/verify flow
- [ ] Test dashboard login
- [ ] Test domain registration
- [ ] Test user management
- [ ] Test analytics
- [ ] Test API documentation

### Documentation
- [ ] Update API URLs in docs
- [ ] Share integration guide with clients
- [ ] Document environment variables
- [ ] Create incident response plan

---

## Monitoring & Maintenance

### Setup Monitoring

1. **UptimeRobot** (uptimerobot.com)
   - Monitor `/health` endpoint
   - Email alerts on downtime

2. **Sentry** (sentry.io)
   ```bash
   npm install @sentry/node
   ```
   ```javascript
   // In server.js
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: 'your-dsn' });
   ```

3. **LogDNA/Papertrail** for logs

### Database Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Configure backup schedule
- Test restore procedure

### Scaling Strategy

1. **Vertical Scaling**
   - Increase server resources
   - Upgrade MongoDB tier

2. **Horizontal Scaling**
   - Multiple app instances
   - Load balancer
   - Read replicas

---

## Cost Estimation

### Free Tier (Development)
- MongoDB Atlas M0: Free
- Heroku Hobby: $7/month
- Vercel Hobby: Free
- SendGrid Free: 100 emails/day
- **Total: ~$7/month**

### Small Production (< 10K users)
- MongoDB Atlas M10: $57/month
- Heroku Standard: $25/month
- Vercel Pro: $20/month
- SendGrid Essentials: $19/month
- **Total: ~$121/month**

### Medium Production (< 100K users)
- MongoDB Atlas M20: $146/month
- AWS EC2 (t3.medium): $30/month
- AWS S3 + CloudFront: $10/month
- SendGrid Pro: $89/month
- **Total: ~$275/month**

---

## Troubleshooting

### "Application Error" on Heroku
```bash
heroku logs --tail
# Check for missing environment variables
```

### "502 Bad Gateway"
- Check if app is running: `heroku ps`
- Verify PORT binding: `process.env.PORT`

### Email Not Sending
- Verify SMTP credentials
- Check email service quotas
- Review logs for errors

### Database Connection Timeout
- Check MongoDB IP whitelist
- Verify connection string
- Check network connectivity

---

## Rollback Procedure

### Heroku
```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback v123
```

### Vercel
```bash
# View deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

---

## Support & Resources

- **MongoDB Atlas Docs:** docs.atlas.mongodb.com
- **Heroku Docs:** devcenter.heroku.com
- **Vercel Docs:** vercel.com/docs
- **SendGrid Docs:** docs.sendgrid.com

---

## 🎉 Deployment Complete!

Your Universal Auth system is now live and ready to authenticate users across all your domains!

**Next Steps:**
1. Test thoroughly in production
2. Monitor for 24-48 hours
3. Optimize based on usage patterns
4. Scale as needed

Good luck! 🚀

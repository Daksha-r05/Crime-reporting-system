# 🚀 Crime Alert System Deployment Guide

## Domain: www.crimealert.in

### 1. Domain Purchase & DNS Setup

**Purchase Domain:**
- Buy `crimealert.in` from Namecheap, GoDaddy, or Google Domains
- Cost: ~$10-15/year

**DNS Configuration:**
```
A Record: @ → [Your Server IP]
CNAME: www → crimealert.in
```

### 2. Frontend Deployment (Vercel - Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd /Users/sriranga/crime
vercel

# Add custom domain
vercel domains add crimealert.in
vercel domains add www.crimealert.in
```

**Vercel Configuration:**
- Framework: Create React App
- Build Command: `cd client && npm run build`
- Output Directory: `client/build`
- Install Command: `cd client && npm install`

### 3. Backend Deployment (Railway - Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set custom domain
railway domain add api.crimealert.in
```

**Railway Configuration:**
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js`

### 4. Database Setup (MongoDB Atlas)

1. **Create Account:** https://cloud.mongodb.com
2. **Create Cluster:** Free tier (M0)
3. **Database Access:** Create user with read/write permissions
4. **Network Access:** Whitelist 0.0.0.0/0 (or specific IPs)
5. **Connection String:** `mongodb+srv://username:password@cluster.mongodb.net/crime-reporting`

### 5. Environment Variables

**Frontend (.env.production):**
```bash
REACT_APP_API_URL=https://api.crimealert.in
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

**Backend (Railway Environment Variables):**
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crime-reporting
JWT_SECRET=your-super-secure-jwt-secret-here
CLIENT_URL=https://www.crimealert.in
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=Crime Alert System <noreply@crimealert.in>
GOOGLE_MAPS_API_KEY=your-google-maps-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### 6. Email Service Setup

**Gmail SMTP (Free):**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in EMAIL_PASS

**Alternative Services:**
- SendGrid: 100 emails/day free
- Mailgun: 5,000 emails/month free
- AWS SES: Pay-per-use

### 7. File Storage (Cloudinary)

1. **Create Account:** https://cloudinary.com
2. **Get Credentials:** Dashboard → Settings → API Keys
3. **Configure:** Add to environment variables

### 8. Google Maps API

1. **Create Project:** https://console.cloud.google.com
2. **Enable APIs:** Maps JavaScript API, Geocoding API
3. **Create API Key:** Restrict to your domains
4. **Add Domains:** www.crimealert.in, api.crimealert.in

### 9. SSL Certificates

**Automatic (Recommended):**
- Vercel: Free SSL included
- Railway: Free SSL included
- Cloudflare: Free SSL + CDN

### 10. Deployment Commands

**Frontend:**
```bash
cd client
npm run build
vercel --prod
```

**Backend:**
```bash
cd server
railway up
```

### 11. Post-Deployment Checklist

- [ ] Domain points to correct servers
- [ ] SSL certificates active
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Email service working
- [ ] File uploads working
- [ ] Google Maps loading
- [ ] All API endpoints responding

### 12. Monitoring & Maintenance

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Error Tracking:**
- Sentry (free tier)
- LogRocket
- Bugsnag

**Analytics:**
- Google Analytics
- Mixpanel
- Hotjar

### 13. Cost Estimation

**Monthly Costs:**
- Domain: ~$1/month
- Vercel: Free (hobby plan)
- Railway: Free (hobby plan)
- MongoDB Atlas: Free (M0 cluster)
- Email: Free (Gmail SMTP)
- Total: ~$1/month

### 14. Security Considerations

- Use strong JWT secrets
- Enable CORS properly
- Rate limiting enabled
- Input validation
- SQL injection protection
- XSS protection
- HTTPS only
- Secure headers

### 15. Backup Strategy

- Database: MongoDB Atlas automatic backups
- Code: GitHub repository
- Files: Cloudinary automatic backup
- Environment: Document all variables

## 🎯 Quick Start Commands

```bash
# 1. Deploy Frontend
cd client
vercel --prod

# 2. Deploy Backend
cd server
railway up

# 3. Configure Domain
vercel domains add crimealert.in
railway domain add api.crimealert.in

# 4. Set Environment Variables
# Add all variables in Railway dashboard
```

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Vercel logs: Vercel dashboard
3. Check MongoDB Atlas logs
4. Verify environment variables
5. Test API endpoints manually

---

**Estimated Total Setup Time: 2-4 hours**
**Monthly Cost: ~$1**
**Uptime: 99.9%+**

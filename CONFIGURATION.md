# 🔧 Configuration Guide

This guide will help you configure the Neighbourhood Crime Reporting System for your environment.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn** package manager

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install-all

# Or install separately
npm install                    # Root dependencies
cd server && npm install      # Backend dependencies
cd ../client && npm install   # Frontend dependencies
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
# Copy the template
cp server/config.env server/.env

# Edit the file with your configuration
nano server/.env
```

## ⚙️ Environment Variables

### Required Configuration

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/crime-reporting

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Optional Configuration

```env
# Google Maps API (for location services)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Firebase Admin (for notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-firebase-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_CLIENT_ID=your-firebase-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-firebase-client-cert-url

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov,application/pdf
```

## 🔑 API Keys Setup

### 1. Google Maps API

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Maps JavaScript API**
4. Create credentials (API key)
5. Restrict the API key to your domain for security

```env
GOOGLE_MAPS_API_KEY=AIzaSyB...your-api-key-here
```

### 2. Cloudinary (File Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Account Details
3. Copy your credentials:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### 3. Firebase (Notifications)

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Go to Project Settings → Service Accounts
3. Generate new private key
4. Download the JSON file
5. Extract values to environment variables

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
```

## 🗄️ Database Setup

### Local MongoDB

1. **Install MongoDB:**
   ```bash
   # macOS (using Homebrew)
   brew install mongodb-community
   
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   # Start MongoDB service
   ```

3. **Verify connection:**
   ```bash
   mongosh
   # Should connect to localhost:27017
   ```

### MongoDB Atlas (Cloud)

1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crime-reporting?retryWrites=true&w=majority
```

## 🚀 Running the Application

### Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server    # Backend only (port 5000)
npm run client    # Frontend only (port 3000)
```

### Production Mode

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🔒 Security Configuration

### JWT Secret

Generate a strong JWT secret:

```bash
# Generate random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use the output in your .env file
JWT_SECRET=generated-secret-here
```

### CORS Configuration

Update CORS settings in `server/index.js` for production:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Rate Limiting

Adjust rate limiting in `server/index.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // requests per windowMs
});
```

## 📱 Frontend Configuration

### Environment Variables

Create `.env` file in `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Tailwind CSS

The system includes custom Tailwind configuration with:
- Custom color palette
- Custom animations
- Responsive utilities
- Custom shadows and borders

## 🧪 Testing Configuration

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## 🚀 Deployment Configuration

### Backend Deployment

1. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Process Manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "crime-reporting-api"
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Frontend Deployment

1. **Build:**
   ```bash
   npm run build
   ```

2. **Deploy to:**
   - Netlify
   - Vercel
   - AWS S3
   - GitHub Pages

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Check if MongoDB is running
   - Verify connection string
   - Check network access

2. **Port Already in Use:**
   ```bash
   # Find process using port
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

3. **CORS Errors:**
   - Verify CLIENT_URL in .env
   - Check CORS configuration
   - Ensure frontend URL matches

4. **JWT Errors:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Verify token format

### Logs

```bash
# Backend logs
cd server
npm run dev

# Frontend logs
cd client
npm start
```

## 📞 Support

For configuration issues:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Check network connectivity

## 🔄 Updates

Keep your system updated:
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

---

**Need help?** Check the main README.md or create an issue in the repository.

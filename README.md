# 🚨 Neighbourhood Crime Reporting System

A comprehensive full-stack web application for citizens to report crimes, police to manage cases, and administrators to oversee the system. Built with modern technologies and best practices for security and user experience.

## ✨ Features

### 🏠 Citizen Interface
- **Crime Reporting**: Submit detailed crime reports with location, evidence, and descriptions
- **Location Tagging**: Google Maps integration for precise crime location marking
- **Anonymous Reporting**: Option to submit reports anonymously for safety
- **Evidence Upload**: Support for photos, videos, and documents
- **Report Tracking**: Monitor the status of submitted reports
- **Real-time Updates**: Get notified about case progress

### 👮 Police Interface
- **Case Management**: View and manage assigned crime reports
- **Status Updates**: Update case status and add investigation notes
- **Officer Assignment**: Assign cases to specific officers
- **Evidence Review**: Access uploaded evidence and documentation
- **Case Prioritization**: Manage cases based on severity and priority

### 🔧 Admin Interface
- **User Management**: Manage citizens, police officers, and admin accounts
- **Verification System**: Verify police officer credentials
- **System Analytics**: View comprehensive crime statistics and trends
- **Content Moderation**: Review and verify crime reports
- **System Monitoring**: Track user activity and system performance

### 🗺️ Advanced Features
- **Heatmap Visualization**: Interactive crime hotspot mapping
- **Real-time Notifications**: Firebase Cloud Messaging integration
- **Mobile Responsive**: Optimized for all device types
- **Secure Authentication**: JWT-based authentication with role-based access
- **File Storage**: Cloudinary integration for secure file handling

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Cloudinary** - Cloud file storage
- **Firebase Admin** - Push notifications

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Leaflet.js** - Interactive maps
- **Chart.js** - Data visualization
- **Tailwind CSS** - Utility-first CSS framework

### External APIs
- **Google Maps API** - Location services and mapping
- **Firebase Cloud Messaging** - Push notifications
- **Cloudinary** - File storage and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crime-reporting-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp server/config.env server/.env
   
   # Edit server/.env with your configuration
   # See Configuration section below
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

5. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run server    # Backend only
   npm run client    # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/crime-reporting

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Google Maps API (Backend)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Client Environment Variables
# Create client/.env file with:
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

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
```

### API Keys Setup

1. **Google Maps API**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API
   - Create credentials (API key)

2. **Cloudinary**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Get cloud name, API key, and secret

3. **Firebase**
   - Create project at [Firebase Console](https://console.firebase.google.com/)
   - Download service account key
   - Enable Cloud Messaging

## 👥 Demo Accounts

For testing purposes, the system includes demo accounts:

- **Citizen**: `citizen@demo.com` / `password123`
- **Police**: `police@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

## 📱 Usage

### For Citizens
1. Register or login to your account
2. Click "Report Crime" to submit a new report
3. Fill in crime details, location, and upload evidence
4. Choose anonymous reporting if needed
5. Track your report status in "My Reports"

### For Police Officers
1. Login with verified police credentials
2. View assigned cases in "Assigned Cases"
3. Update case status and add investigation notes
4. Assign cases to other officers if needed
5. Access all crime reports in "All Reports"

### For Administrators
1. Access admin dashboard for system overview
2. Manage user accounts and verify police credentials
3. Monitor system statistics and user activity
4. Review crime reports requiring verification
5. Manage system-wide settings and configurations

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user types
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Controlled cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **Password Hashing**: Bcrypt encryption for user passwords

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Crime Endpoints
- `POST /api/crimes` - Submit crime report
- `GET /api/crimes` - Get crime reports (with filters)
- `GET /api/crimes/:id` - Get specific crime report
- `PUT /api/crimes/:id/status` - Update crime status
- `GET /api/crimes/heatmap/data` - Get heatmap data

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - User management
- `PUT /api/admin/users/:id/verify` - Verify police users
- `GET /api/admin/crimes/verification-needed` - Reports needing verification

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run all tests
npm run test:all
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (Nginx/Apache)
4. Set up SSL certificates
5. Configure MongoDB connection

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to CDN or static hosting
3. Configure environment variables
4. Update API endpoints for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **AI Integration**: Automated crime pattern analysis
- **Blockchain**: Immutable crime report storage
- **IoT Integration**: Smart city sensor integration
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Machine learning insights

---

**Built with ❤️ for safer communities**

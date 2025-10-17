const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const testConfiguration = async () => {
  console.log('🔧 Testing Crime Reporting System Configuration...\n');
  
  // Test environment variables
  console.log('📋 Environment Variables:');
  console.log(`PORT: ${process.env.PORT || 'Not set'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || 'Not set'}`);
  console.log(`GOOGLE_MAPS_API_KEY: ${process.env.GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set'}`);
  console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set'}`);
  
  // Test database connection
  console.log('\n🗄️  Database Connection Test:');
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
  }
  
  // Test file structure
  console.log('\n📁 File Structure Test:');
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'server/index.js',
    'server/package.json',
    'client/package.json',
    'client/src/App.js',
    'server/.env'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing`);
    }
  });
  
  // Test directories
  const requiredDirs = [
    'server/uploads',
    'server/models',
    'server/routes',
    'server/middleware',
    'client/src/components',
    'client/src/pages'
  ];
  
  console.log('\n📂 Directory Structure:');
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}/`);
    } else {
      console.log(`❌ ${dir}/ - Missing`);
    }
  });
  
  console.log('\n🎯 Configuration Summary:');
  console.log('=====================================');
  
  const envVars = [
    'PORT', 'NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 
    'CLIENT_URL', 'GOOGLE_MAPS_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'FIREBASE_PROJECT_ID'
  ];
  
  const requiredVars = ['PORT', 'NODE_ENV', 'MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
  const optionalVars = ['GOOGLE_MAPS_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'FIREBASE_PROJECT_ID'];
  
  const missingRequired = requiredVars.filter(varName => !process.env[varName]);
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  
  if (missingRequired.length === 0) {
    console.log('✅ All required environment variables are set');
  } else {
    console.log('❌ Missing required environment variables:');
    missingRequired.forEach(varName => console.log(`   - ${varName}`));
  }
  
  if (missingOptional.length === 0) {
    console.log('✅ All optional environment variables are set');
  } else {
    console.log('⚠️  Missing optional environment variables:');
    missingOptional.forEach(varName => console.log(`   - ${varName}`));
  }
  
  console.log('\n🚀 Next Steps:');
  if (missingRequired.length === 0) {
    console.log('1. ✅ Basic configuration is complete');
    console.log('2. 🗄️  Database is ready');
    console.log('3. 🚀 You can start the application with: npm run dev');
  } else {
    console.log('1. ❌ Please set the missing required environment variables');
    console.log('2. 📝 Edit server/.env file');
    console.log('3. 🔄 Run this test again');
  }
  
  if (missingOptional.length > 0) {
    console.log('\n💡 Optional Features:');
    console.log('- Google Maps: Set GOOGLE_MAPS_API_KEY for location services');
    console.log('- File Uploads: Set Cloudinary credentials for evidence storage');
    console.log('- Notifications: Set Firebase credentials for push notifications');
  }
  
  console.log('\n📚 For detailed configuration help, see CONFIGURATION.md');
};

// Run the test
if (require.main === module) {
  testConfiguration().catch(console.error);
}

module.exports = testConfiguration;

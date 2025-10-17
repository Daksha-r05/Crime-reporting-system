const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-reporting');
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}, 'email username role isVerified isActive');
    console.log('\n📋 Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Verified: ${user.isVerified}, Active: ${user.isActive}`);
    });

    // Test admin login
    const adminUser = await User.findOne({ email: 'admin@demo.com' });
    if (adminUser) {
      console.log('\n🔐 Testing admin login...');
      const isValidPassword = await bcrypt.compare('password123', adminUser.password);
      console.log(`Password match: ${isValidPassword}`);
      console.log(`User details:`, {
        email: adminUser.email,
        role: adminUser.role,
        isVerified: adminUser.isVerified,
        isActive: adminUser.isActive
      });
    } else {
      console.log('\n❌ Admin user not found');
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  checkUsers();
}

module.exports = checkUsers;

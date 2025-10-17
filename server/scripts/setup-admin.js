const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createInitialUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-reporting');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@demo.com',
      password: 'password123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');

    // Create demo police user
    const policeUser = new User({
      username: 'police',
      email: 'police@demo.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Officer',
      role: 'police',
      badgeNumber: 'PD001',
      department: 'Central Police Department',
      isVerified: false, // Needs admin verification
      isActive: true
    });

    await policeUser.save();
    console.log('✅ Demo police user created successfully');

    // Create demo citizen user
    const citizenUser = new User({
      username: 'citizen',
      email: 'citizen@demo.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Citizen',
      role: 'citizen',
      isVerified: true,
      isActive: true,
      address: {
        street: '123 Main Street',
        city: 'Sample City',
        state: 'CA',
        zipCode: '12345'
      }
    });

    await citizenUser.save();
    console.log('✅ Demo citizen user created successfully');

    console.log('\n🎉 Initial users created successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Police: police@demo.com / password123');
    console.log('Citizen: citizen@demo.com / password123');
    console.log('\nNote: Police user needs admin verification to access police features.');

  } catch (error) {
    console.error('Error creating initial users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  createInitialUsers();
}

module.exports = createInitialUsers;

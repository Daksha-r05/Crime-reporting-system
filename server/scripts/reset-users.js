const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-reporting');
    console.log('Connected to MongoDB');

    // Delete existing demo users
    await User.deleteMany({ email: { $in: ['admin@demo.com', 'police@demo.com', 'citizen@demo.com'] } });
    console.log('🗑️  Deleted existing demo users');

    // Create admin user - use updateOne with upsert to avoid pre-save hook
    const adminPassword = await bcrypt.hash('password123', 12);
    await User.updateOne(
      { email: 'admin@demo.com' },
      {
        username: 'admin',
        email: 'admin@demo.com',
        password: adminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        isVerified: true,
        isActive: true
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Admin user created successfully');

    // Create demo police user
    const policePassword = await bcrypt.hash('password123', 12);
    await User.updateOne(
      { email: 'police@demo.com' },
      {
        username: 'police',
        email: 'police@demo.com',
        password: policePassword,
        firstName: 'John',
        lastName: 'Officer',
        role: 'police',
        badgeNumber: 'PD001',
        department: 'Central Police Department',
        isVerified: false, // Needs admin verification
        isActive: true
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Demo police user created successfully');

    // Create demo citizen user
    const citizenPassword = await bcrypt.hash('password123', 12);
    await User.updateOne(
      { email: 'citizen@demo.com' },
      {
        username: 'citizen',
        email: 'citizen@demo.com',
        password: citizenPassword,
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
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Demo citizen user created successfully');

    console.log('\n🎉 Demo users reset successfully!');
    console.log('\nDemo Accounts:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Police: police@demo.com / password123');
    console.log('Citizen: citizen@demo.com / password123');

  } catch (error) {
    console.error('Error resetting users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  resetUsers();
}

module.exports = resetUsers;

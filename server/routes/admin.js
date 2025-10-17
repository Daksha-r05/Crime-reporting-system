const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Crime = require('../models/Crime');
const { auth, requireAdmin } = require('../middleware/auth');
const { getQueueStatus } = require('../services/emailQueue');

const router = express.Router();

// All admin routes require admin role
router.use(auth, requireAdmin);

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isVerified,
      isActive,
      search
    } = req.query;

    const filter = {};

    // Apply filters
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get specific user details
// @access  Private (Admin only)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Admin user fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify a police user account
// @access  Private (Admin only)
router.put('/users/:id/verify', [
  body('isVerified')
    .isBoolean()
    .withMessage('isVerified must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'police') {
      return res.status(400).json({ message: 'Only police accounts can be verified' });
    }

    user.isVerified = isVerified;
    await user.save();

    res.json({
      message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ message: 'Server error during user verification' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/deactivate a user account
// @access  Private (Admin only)
router.put('/users/:id/status', [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ message: 'Server error during user status update' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  body('role')
    .isIn(['citizen', 'police', 'admin'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    user.role = role;
    
    // Reset verification status when changing roles
    if (role === 'citizen') {
      user.isVerified = true;
      user.badgeNumber = undefined;
      user.department = undefined;
    } else if (role === 'police') {
      user.isVerified = false;
    }

    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('User role update error:', error);
    res.status(500).json({ message: 'Server error during role update' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Check if user has any crime reports
    const crimeCount = await Crime.countDocuments({ reporter: user._id });
    if (crimeCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing crime reports. Deactivate instead.' 
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // User statistics
    const userStats = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          citizens: {
            $sum: { $cond: [{ $eq: ['$role', 'citizen'] }, 1, 0] }
          },
          police: {
            $sum: { $cond: [{ $eq: ['$role', 'police'] }, 1, 0] }
          },
          admins: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    // Crime statistics
    const crimeStats = await Crime.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCrimes: { $sum: 1 },
          pendingCrimes: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          underInvestigation: {
            $sum: { $cond: [{ $eq: ['$status', 'under_investigation'] }, 1, 0] }
          },
          resolvedCrimes: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          anonymousReports: {
            $sum: { $cond: ['$isAnonymous', 1, 0] }
          }
        }
      }
    ]);

    // Recent activity
    const recentUsers = await User.find()
      .select('username firstName lastName role createdAt isVerified')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCrimes = await Crime.find()
      .populate('reporter', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      userStats: userStats[0] || {
        totalUsers: 0,
        citizens: 0,
        police: 0,
        admins: 0,
        verifiedUsers: 0,
        activeUsers: 0
      },
      crimeStats: crimeStats[0] || {
        totalCrimes: 0,
        pendingCrimes: 0,
        underInvestigation: 0,
        resolvedCrimes: 0,
        anonymousReports: 0
      },
      recentUsers,
      recentCrimes
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/crimes/verification-needed
// @desc    Get crimes that need verification
// @access  Private (Admin only)
router.get('/crimes/verification-needed', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const crimes = await Crime.find({ verificationStatus: 'unverified' })
      .populate('reporter', 'firstName lastName')
      .populate('assignedOfficer', 'firstName lastName badgeNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Crime.countDocuments({ verificationStatus: 'unverified' });

    res.json({
      crimes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Verification needed error:', error);
    res.status(500).json({ message: 'Server error while fetching verification data' });
  }
});

// @route   PUT /api/admin/crimes/:id/verify
// @desc    Verify a crime report
// @access  Private (Admin only)
router.put('/crimes/:id/verify', [
  body('verificationStatus')
    .isIn(['verified', 'false_report'])
    .withMessage('Invalid verification status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { verificationStatus } = req.body;
    const crime = await Crime.findById(req.params.id);

    if (!crime) {
      return res.status(404).json({ message: 'Crime report not found' });
    }

    await crime.verifyReport(verificationStatus, req.user._id);

    res.json({
      message: 'Crime report verification updated successfully',
      crime
    });

  } catch (error) {
    console.error('Crime verification error:', error);
    res.status(500).json({ message: 'Server error during crime verification' });
  }
});

// @route   GET /api/admin/email-queue
// @desc    Get email queue status
// @access  Private (Admin only)
router.get('/email-queue', async (req, res) => {
  try {
    const queueStatus = getQueueStatus();
    res.json({
      message: 'Email queue status retrieved successfully',
      queue: queueStatus
    });
  } catch (error) {
    console.error('Email queue status error:', error);
    res.status(500).json({ message: 'Server error retrieving email queue status' });
  }
});

module.exports = router;

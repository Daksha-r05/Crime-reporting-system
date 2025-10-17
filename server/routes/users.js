const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Crime = require('../models/Crime');
const { auth, requirePolice, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Street address cannot be empty'),
  body('address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),
  body('address.zipCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Zip code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { firstName, lastName, phone, address } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   GET /api/users/my-reports
// @desc    Get current user's crime reports
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category
    } = req.query;

    const filter = { reporter: req.user._id };

    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    
    const crimes = await Crime.find(filter)
      .populate('assignedOfficer', 'firstName lastName badgeNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Crime.countDocuments(filter);

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
    console.error('My reports fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
});

// @route   GET /api/users/assigned-cases
// @desc    Get cases assigned to police officer
// @access  Private (Police only)
router.get('/assigned-cases', [
  auth,
  requirePolice
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const filter = { assignedOfficer: req.user._id };

    // Apply filters
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    
    const crimes = await Crime.find(filter)
      .populate('reporter', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Crime.countDocuments(filter);

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
    console.error('Assigned cases fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching assigned cases' });
  }
});

// @route   GET /api/users/available-officers
// @desc    Get available police officers for assignment
// @access  Private (Admin only)
router.get('/available-officers', [
  auth,
  requireAdmin
], async (req, res) => {
  try {
    const officers = await User.find({
      role: 'police',
      isActive: true
    }).select('firstName lastName badgeNumber department');

    res.json({ officers });

  } catch (error) {
    console.error('Available officers fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching officers' });
  }
});

// @route   POST /api/users/fcm-token
// @desc    Update user's FCM token for notifications
// @access  Private
router.post('/fcm-token', [
  auth,
  body('fcmToken')
    .notEmpty()
    .withMessage('FCM token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { fcmToken } = req.body;

    await User.findByIdAndUpdate(req.user._id, { fcmToken });

    res.json({ message: 'FCM token updated successfully' });

  } catch (error) {
    console.error('FCM token update error:', error);
    res.status(500).json({ message: 'Server error during FCM token update' });
  }
});

// @route   GET /api/users/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    // This would integrate with a notification service
    // For now, return a placeholder
    res.json({
      notifications: [],
      message: 'Notification system not yet implemented'
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// @route   PUT /api/users/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    // This would integrate with a notification service
    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({ message: 'Server error during notification update' });
  }
});

module.exports = router;

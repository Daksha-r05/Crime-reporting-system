const express = require('express');
const { body, validationResult } = require('express-validator');
const Crime = require('../models/Crime');
const User = require('../models/User');
const { auth, requirePolice, requireCitizen, requireAdmin } = require('../middleware/auth');
const { queueFIRConfirmation } = require('../services/emailQueue');

const router = express.Router();

// @route   POST /api/crimes
// @desc    Report a new crime
// @access  Private (Citizens)
router.post('/', [
	auth,
	requireCitizen,
	body('title')
		.trim()
		.isLength({ min: 5, max: 200 })
		.withMessage('Title must be between 5 and 200 characters'),
	body('description')
		.trim()
		.isLength({ min: 10, max: 1000 })
		.withMessage('Description must be between 10 and 1000 characters'),
	body('category')
		.isIn(['theft', 'assault', 'vandalism', 'fraud', 'burglary', 'vehicle_theft', 'harassment', 'drug_related', 'other'])
		.withMessage('Invalid crime category'),
	body('severity')
		.isIn(['low', 'medium', 'high', 'critical'])
		.withMessage('Invalid severity level'),
	body('location.address')
		.trim()
		.notEmpty()
		.withMessage('Address is required'),
	body('location.coordinates.lat')
		.isFloat({ min: -90, max: 90 })
		.withMessage('Invalid latitude'),
	body('location.coordinates.lng')
		.isFloat({ min: -180, max: 180 })
		.withMessage('Invalid longitude'),
	body('dateTime')
		.isISO8601()
		.withMessage('Invalid date format'),
	body('isAnonymous')
		.optional()
		.isBoolean()
		.withMessage('isAnonymous must be a boolean'),
	body('firRequested')
		.optional()
		.isBoolean()
		.withMessage('firRequested must be a boolean')
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ 
				message: 'Validation failed',
				errors: errors.array() 
			});
		}

		const {
			title,
			description,
			category,
			severity,
			location,
			dateTime,
			isAnonymous = false,
			firRequested = false,
			evidence,
			estimatedLoss,
			witnesses,
			tags
		} = req.body;

		// Create new crime report
		const crime = new Crime({
			reporter: req.user._id,
			title,
			description,
			category,
			severity,
			location,
			dateTime: new Date(dateTime),
			isAnonymous,
			firRequested,
			firStatus: firRequested ? 'pending' : 'not_requested',
			evidence: evidence || {},
			estimatedLoss,
			witnesses: witnesses || [],
			tags: tags || []
		});

		await crime.save();

		// Populate reporter info (excluding anonymous reports)
		if (!isAnonymous) {
			await crime.populate('reporter', 'firstName lastName email');
		}

		// Queue FIR confirmation email if requested
		if (firRequested && !isAnonymous) {
			queueFIRConfirmation(req.user.email, req.user.firstName, crime);
			console.log('FIR confirmation email queued for:', req.user.email);
		}

		res.status(201).json({
			message: 'Crime report submitted successfully',
			crime: {
				...crime.toObject(),
				reporter: isAnonymous ? 'Anonymous' : crime.reporter
			}
		});

	} catch (error) {
		console.error('Crime report error:', error);
		res.status(500).json({ message: 'Server error during crime report submission', error: error.message });
	}
});

// @route   GET /api/crimes
// @desc    Get all crime reports (with filters)
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			category,
			status,
			severity,
			city,
			startDate,
			endDate,
			search
		} = req.query;

		const filter = {};

		// Apply filters
		if (category) filter.category = category;
		if (status) filter.status = status;
		if (severity) filter.severity = severity;
		if (city) filter['location.city'] = new RegExp(city, 'i');
		if (search) {
			filter.$or = [
				{ title: new RegExp(search, 'i') },
				{ description: new RegExp(search, 'i') }
			];
		}

		// Date range filter
		if (startDate || endDate) {
			filter.dateTime = {};
			if (startDate) filter.dateTime.$gte = new Date(startDate);
			if (endDate) filter.dateTime.$lte = new Date(endDate);
		}

		// Role-based filtering
		if (req.user.role === 'citizen') {
			// Citizens can only see their own reports and public reports
			filter.$or = [
				{ reporter: req.user._id },
				{ isAnonymous: false, status: { $ne: 'closed' } }
			];
		} else if (req.user.role === 'police') {
			// Police can see all reports
			// Optionally, add jurisdiction filters in the future
		}
		// Admins can see all reports

		const skip = (page - 1) * limit;
		
		const crimes = await Crime.find(filter)
			.populate('reporter', 'firstName lastName')
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
		console.error('Crime fetch error:', error);
		res.status(500).json({ message: 'Server error while fetching crimes' });
	}
});

// @route   GET /api/crimes/:id
// @desc    Get specific crime report
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const crime = await Crime.findById(req.params.id)
			.populate('reporter', 'firstName lastName')
			.populate('assignedOfficer', 'firstName lastName badgeNumber')
			.populate('policeNotes.officer', 'firstName lastName badgeNumber');

		if (!crime) {
			return res.status(404).json({ message: 'Crime report not found' });
		}

		// Check access permissions
		if (req.user.role === 'citizen' && 
				crime.reporter.toString() !== req.user._id.toString() && 
				crime.isAnonymous) {
			return res.status(403).json({ message: 'Access denied' });
		}

		res.json({ crime });

	} catch (error) {
		console.error('Crime fetch error:', error);
		res.status(500).json({ message: 'Server error while fetching crime report' });
	}
});

// @route   PUT /api/crimes/:id/status
// @desc    Update crime status (Police only)
// @access  Private (Police)
router.put('/:id/status', [
	auth,
	requirePolice,
	body('status')
		.isIn(['pending', 'under_investigation', 'resolved', 'closed', 'false_report'])
		.withMessage('Invalid status'),
	body('note')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Note cannot be empty if provided')
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ 
				message: 'Validation failed',
				errors: errors.array() 
			});
		}

		const { status, note } = req.body;
		const crime = await Crime.findById(req.params.id);

		if (!crime) {
			return res.status(404).json({ message: 'Crime report not found' });
		}

		await crime.updateStatus(status, req.user._id, note);

		res.json({
			message: 'Status updated successfully',
			crime
		});

	} catch (error) {
		console.error('Status update error:', error);
		res.status(500).json({ message: 'Server error during status update' });
	}
});

// @route   PUT /api/crimes/:id/assign
// @desc    Assign officer to crime (Admin only)
// @access  Private (Admin)
router.put('/:id/assign', [
  auth,
  requireAdmin,
  body('officerId')
    .isMongoId()
    .withMessage('Valid officer ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { officerId } = req.body;
    
    // Verify officer exists and is police
    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'police') {
      return res.status(400).json({ message: 'Invalid officer ID' });
    }

    const crime = await Crime.findById(req.params.id);
    if (!crime) {
      return res.status(404).json({ message: 'Crime report not found' });
    }

    await crime.assignOfficer(officerId);

    res.json({
      message: 'Officer assigned successfully',
      crime
    });

  } catch (error) {
    console.error('Officer assignment error:', error);
    res.status(500).json({ message: 'Server error during officer assignment' });
  }
});

// @route   GET /api/crimes/heatmap/data
// @desc    Get crime data for heatmap visualization
// @access  Private
router.get('/heatmap/data', auth, async (req, res) => {
	try {
		const { startDate, endDate, category } = req.query;
		const filter = {};

		// Date range filter
		if (startDate || endDate) {
			filter.dateTime = {};
			if (startDate) filter.dateTime.$gte = new Date(startDate);
			if (endDate) filter.dateTime.$lte = new Date(endDate);
		}

		// Category filter
		if (category) filter.category = category;

		// Role-based filtering
		if (req.user.role === 'citizen') {
			filter.isAnonymous = false;
		}

		const crimes = await Crime.find(filter, 'location.coordinates category severity');

		const heatmapData = crimes.map(crime => ({
			lat: crime.location.coordinates.lat,
			lng: crime.location.coordinates.lng,
			weight: crime.severity === 'critical' ? 5 : 
					crime.severity === 'high' ? 4 :
					crime.severity === 'medium' ? 3 : 1,
			category: crime.category
		}));

		res.json({ heatmapData });

	} catch (error) {
		console.error('Heatmap data error:', error);
		res.status(500).json({ message: 'Server error while fetching heatmap data' });
	}
});

// @route   GET /api/crimes/stats/summary
// @desc    Get crime statistics summary
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
	try {
		const { startDate, endDate } = req.query;
		const filter = {};

		// Date range filter
		if (startDate || endDate) {
			filter.dateTime = {};
			if (startDate) filter.dateTime.$gte = new Date(startDate);
			if (endDate) filter.dateTime.$lte = new Date(endDate);
		}

		// Role-based filtering
		if (req.user.role === 'citizen') {
			filter.isAnonymous = false;
		}

		const stats = await Crime.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: null,
					totalReports: { $sum: 1 },
					pendingReports: {
						$sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
					},
					resolvedReports: {
						$sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
					},
					byCategory: {
						$push: '$category'
					},
					bySeverity: {
						$push: '$severity'
					}
				}
			}
		]);

		if (stats.length === 0) {
			return res.json({
				totalReports: 0,
				pendingReports: 0,
				resolvedReports: 0,
				categoryBreakdown: {},
				severityBreakdown: {}
			});
		}

		const stat = stats[0];
		
		// Calculate category breakdown
		const categoryBreakdown = stat.byCategory.reduce((acc, category) => {
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {});

		// Calculate severity breakdown
		const severityBreakdown = stat.bySeverity.reduce((acc, severity) => {
			acc[severity] = (acc[severity] || 0) + 1;
			return acc;
		}, {});

		res.json({
			totalReports: stat.totalReports,
			pendingReports: stat.pendingReports,
			resolvedReports: stat.resolvedReports,
			categoryBreakdown,
			severityBreakdown
		});

	} catch (error) {
		console.error('Stats error:', error);
		res.status(500).json({ message: 'Server error while fetching statistics' });
	}
});

// @route   GET /api/crimes/fir/requests
// @desc    List crimes with FIR requested/status (Police/Admin)
// @access  Private (Police/Admin)
router.get('/fir/requests', auth, requirePolice, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'pending' // pending | approved | rejected | all
    } = req.query;

    const filter = {};
    if (status === 'all') {
      filter.firStatus = { $in: ['pending', 'approved', 'rejected'] };
    } else {
      filter.firStatus = status;
    }

    const skip = (page - 1) * limit;

    const crimes = await Crime.find(filter)
      .populate('reporter', 'firstName lastName email phone')
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
    console.error('FIR list error:', error);
    res.status(500).json({ message: 'Server error while fetching FIR requests' });
  }
});

// @route   PUT /api/crimes/:id/fir
// @desc    Update FIR status (approve/reject) (Police/Admin)
// @access  Private (Police/Admin)
router.put('/:id/fir', [
  auth,
  requirePolice,
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('action must be approve or reject'),
  body('firNumber')
    .optional()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage('firNumber must be 3-50 characters when provided'),
  body('note')
    .optional()
    .trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { action, firNumber, note } = req.body;
    const crime = await Crime.findById(req.params.id);

    if (!crime) {
      return res.status(404).json({ message: 'Crime report not found' });
    }

    if (crime.firStatus === 'not_requested') {
      return res.status(400).json({ message: 'FIR was not requested for this report' });
    }

    if (action === 'approve') {
      crime.firStatus = 'approved';
      crime.firNumber = firNumber || crime.firNumber || `FIR-${Date.now()}`;
      crime.firApprovedAt = new Date();
      crime.firApprovedBy = req.user._id;
    } else if (action === 'reject') {
      crime.firStatus = 'rejected';
      crime.firApprovedAt = undefined;
      crime.firApprovedBy = undefined;
      crime.firNumber = undefined;
    }

    // Append police note if provided
    if (note) {
      crime.policeNotes.push({ officer: req.user._id, note, timestamp: new Date() });
    }

    await crime.save();

    res.json({
      message: `FIR ${action}d successfully`,
      crime
    });
  } catch (error) {
    console.error('FIR update error:', error);
    res.status(500).json({ message: 'Server error during FIR update' });
  }
});

module.exports = router;

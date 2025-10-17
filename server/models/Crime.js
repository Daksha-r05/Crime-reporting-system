const mongoose = require('mongoose');

const crimeSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'theft',
      'assault',
      'vandalism',
      'fraud',
      'burglary',
      'vehicle_theft',
      'harassment',
      'drug_related',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    city: String,
    state: String,
    zipCode: String
  },
  dateTime: {
    type: Date,
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  firRequested: {
    type: Boolean,
    default: false
  },
  firStatus: {
    type: String,
    enum: ['not_requested', 'pending', 'approved', 'rejected'],
    default: 'not_requested'
  },
  firNumber: {
    type: String,
    sparse: true
  },
  firApprovedAt: {
    type: Date,
    sparse: true
  },
  firApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  evidence: {
    photos: [{
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    videos: [{
      url: String,
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    documents: [{
      url: String,
      name: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'under_investigation', 'resolved', 'closed', 'false_report'],
    default: 'pending'
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  policeNotes: [{
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'false_report'],
    default: 'unverified'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  verifiedAt: {
    type: Date,
    sparse: true
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  estimatedLoss: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  witnesses: [{
    name: String,
    contact: String,
    statement: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
crimeSchema.index({ location: '2dsphere' });
crimeSchema.index({ category: 1, status: 1 });
crimeSchema.index({ createdAt: -1 });
crimeSchema.index({ severity: 1, priority: 1 });

// Virtual for full address
crimeSchema.virtual('fullAddress').get(function() {
  const loc = this.location;
  return `${loc.address}, ${loc.city}, ${loc.state} ${loc.zipCode}`;
});

// Method to update status
crimeSchema.methods.updateStatus = function(newStatus, officerId, note = '') {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  if (officerId && note) {
    this.policeNotes.push({
      officer: officerId,
      note: note,
      timestamp: new Date()
    });
  }
  
  return this.save();
};

// Method to assign officer
crimeSchema.methods.assignOfficer = function(officerId) {
  this.assignedOfficer = officerId;
  this.updatedAt = new Date();
  return this.save();
};

// Method to verify report
crimeSchema.methods.verifyReport = function(verificationStatus, verifiedBy) {
  this.verificationStatus = verificationStatus;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Crime', crimeSchema);

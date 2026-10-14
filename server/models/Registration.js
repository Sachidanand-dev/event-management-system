const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  eventId: {
    type: String,
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  userId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    default: ''
  },
  eventTime: {
    type: String,
    default: ''
  },
  eventVenue: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRollNo: {
    type: String,
    default: 'N/A'
  },
  department: {
    type: String,
    default: 'N/A'
  },
  seatNumber: {
    type: String,
    default: 'GEN-ENTRY'
  },
  status: {
    type: String,
    enum: ['confirmed', 'attended', 'cancelled'],
    default: 'confirmed'
  },
  qrData: {
    type: String,
    default: ''
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Registration', registrationSchema);

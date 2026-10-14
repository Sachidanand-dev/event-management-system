const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required']
  },
  category: {
    type: String,
    enum: ['Urgent', 'Info', 'Academic'],
    default: 'Urgent'
  },
  author: {
    type: String,
    default: 'Campus Administration'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  date: {
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

module.exports = mongoose.model('Announcement', announcementSchema);

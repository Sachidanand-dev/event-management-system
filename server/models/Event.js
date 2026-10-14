const mongoose = require('mongoose');

const agendaItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  activity: { type: String, required: true }
}, { _id: false });

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  tagline: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technical', 'Cultural', 'Workshop', 'Sports', 'Other'],
    default: 'Technical'
  },
  date: {
    type: String,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    default: '10:00 AM - 04:00 PM'
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1'],
    default: 100
  },
  registeredCount: {
    type: Number,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
  },
  organizer: {
    type: String,
    default: 'Campus Administration'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  agenda: {
    type: [agendaItemSchema],
    default: []
  },
  speakers: {
    type: [speakerSchema],
    default: []
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

module.exports = mongoose.model('Event', eventSchema);

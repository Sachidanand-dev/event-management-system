const crypto = require('crypto');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

// POST /api/registrations/register
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check duplicate active registration
    const existing = await Registration.findOne({
      $and: [
        { $or: [{ eventId: eventId }, { event: event._id }] },
        { $or: [{ userId: userId }, { user: userId }] },
        { status: { $ne: 'cancelled' } }
      ]
    });

    if (existing) {
      return res.status(409).json({ message: 'You are already registered for this event', ticket: existing });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'Sorry, registration is closed. Event capacity has been reached!' });
    }

    const user = await User.findById(userId);
    const categoryPrefix = (event.category || 'EVNT').slice(0, 4).toUpperCase();
    const ticketCode = `TK-${categoryPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    const seatZone = ['ZONE-A', 'ZONE-B', 'ZONE-C', 'DESK', 'SEAT'][Math.floor(Math.random() * 5)];
    const seatNumber = `${seatZone}-${Math.floor(1 + Math.random() * 150)}`;

    const newRegistration = await Registration.create({
      ticketId: ticketCode,
      eventId: event._id.toString(),
      event: event._id,
      userId: user._id.toString(),
      user: user._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      userName: user.name,
      userEmail: user.email,
      userRollNo: user.rollNo || 'N/A',
      department: user.department || 'N/A',
      seatNumber,
      status: 'confirmed',
      qrData: `NEXEVENT:${ticketCode}:${event._id.toString()}:${user._id.toString()}`
    });

    // Increment event counter
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    res.status(201).json({
      message: 'Registration successful! Your digital ticket is ready.',
      registration: newRegistration
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const registrations = await Registration.find({
      $or: [{ userId: userId }, { user: userId }]
    }).sort({ registeredAt: -1 }).populate('event');

    res.json({ registrations });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/registrations/cancel/:id
exports.cancelRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const registration = await Registration.findOne({
      _id: req.params.id,
      $or: [{ userId: userId }, { user: userId }]
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Decrement event count
    await Event.findByIdAndUpdate(registration.eventId || registration.event, {
      $inc: { registeredCount: -1 }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

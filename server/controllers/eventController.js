const Event = require('../models/Event');
const Registration = require('../models/Registration');

// GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    next(error);
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event });
  } catch (error) {
    next(error);
  }
};

// POST /api/events (Admin Only)
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title, tagline, category, date, time, venue,
      capacity, price, image, organizer, description, tags, agenda, speakers, featured
    } = req.body;

    if (!title || !category || !date || !venue) {
      return res.status(400).json({ message: 'Title, category, date, and venue are required' });
    }

    const parsedTags = Array.isArray(tags) 
      ? tags 
      : (tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : ['Campus', category]);

    const newEvent = await Event.create({
      title,
      tagline: tagline || '',
      category,
      date,
      time: time || '10:00 AM - 04:00 PM',
      venue,
      capacity: Number(capacity) || 100,
      registeredCount: 0,
      price: Number(price) || 0,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      organizer: organizer || 'Campus Administration',
      status: 'upcoming',
      featured: Boolean(featured),
      description: description || '',
      tags: parsedTags,
      agenda: Array.isArray(agenda) ? agenda : [],
      speakers: Array.isArray(speakers) ? speakers : []
    });

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    next(error);
  }
};

// PUT /api/events/:id (Admin Only)
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { registeredCount, _id, id, ...updateFields } = req.body;

    if (updateFields.tags && typeof updateFields.tags === 'string') {
      updateFields.tags = updateFields.tags.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Event updated successfully', event: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/events/:id (Admin Only)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Also remove registrations linked to this event
    await Registration.deleteMany({ $or: [{ eventId: req.params.id }, { event: req.params.id }] });

    res.json({ message: 'Event and associated registrations deleted' });
  } catch (error) {
    next(error);
  }
};

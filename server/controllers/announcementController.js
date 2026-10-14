const Announcement = require('../models/Announcement');

// GET /api/announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ pinned: -1, date: -1 });
    res.json({ announcements });
  } catch (error) {
    next(error);
  }
};

// POST /api/announcements (Admin Only)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, category, pinned } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const newAnnouncement = await Announcement.create({
      title,
      message,
      category: category || 'Urgent',
      author: req.user?.name || 'Campus Administration',
      pinned: Boolean(pinned),
      date: new Date()
    });

    res.status(201).json({ message: 'Announcement broadcasted successfully', announcement: newAnnouncement });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/announcements/:id (Admin Only)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};

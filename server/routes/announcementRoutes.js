const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', announcementController.getAnnouncements);
router.post('/', authenticateToken, requireAdmin, announcementController.createAnnouncement);
router.delete('/:id', authenticateToken, requireAdmin, announcementController.deleteAnnouncement);

module.exports = router;

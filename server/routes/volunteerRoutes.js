const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const { authenticateToken, requireVolunteerOrAdmin } = require('../middleware/auth');

router.get('/duty', authenticateToken, requireVolunteerOrAdmin, volunteerController.getVolunteerDuty);

module.exports = router;

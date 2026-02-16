const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

// Get user profile by ID (public)
router.get('/:userId', profileController.getProfile);

// Update own profile (protected)
router.put('/', authMiddleware, profileController.updateProfile);

module.exports = router;

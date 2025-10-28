const express = require('express');
const router = express.Router();

// Import the controller function
const { getUserById } = require('../controllers/userController');

// Define the route for fetching a single user by ID
// The ':id' is a URL parameter that will be passed to the controller
router.get('/:id', getUserById);

module.exports = router;
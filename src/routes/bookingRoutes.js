// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();

// Import the controller functions and the middleware
const { 
  createBooking,
  getBookingsByUser 
} = require('../controllers/bookingController');

const { mockAuth } = require('../middleware/authMiddleware'); // <-- Import middleware

// Define the POST route for creating a new booking (PROTECTED)
// Requests must first pass through mockAuth()
router.post('/', mockAuth, createBooking); 

// Define the GET route for listing a user's bookings (PROTECTED)
router.get('/user/:userId', mockAuth, getBookingsByUser); 

module.exports = router;
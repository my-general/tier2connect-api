const express = require('express');
const router = express.Router();

// Import the controller functions
const { 
  getAllServices, 
  createService 
} = require('../controllers/serviceController');

// Define the routes
// When we get a GET request at '/', call getAllServices
router.get('/', getAllServices);

// When we get a POST request at '/', call createService
router.post('/', createService);

module.exports = router;
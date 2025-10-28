// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Import our new user routes
const userRoutes = require('./routes/userRoutes');
// Import our new booking routes
const bookingRoutes = require('./routes/bookingRoutes');
// Load environment variables from .env file
dotenv.config();

// --- Middleware ---
const app = express();
app.use(cors()); // Enable CORS for all requests
app.use(express.json()); // Enable the server to read and parse JSON bodies

// --- Routes ---
// Import our new service routes
const serviceRoutes = require('./routes/serviceRoutes');

// Tell Express to use our service routes
// Any request to '/api/services' will be handled by serviceRoutes
app.use('/api/services', serviceRoutes);


// --- Base Route ---
app.get('/', (req, res) => {
  res.send('Tier2Connect API is running!');
});
// Tell Express to use our service routes
app.use('/api/services', serviceRoutes);

// ** Add the user route here **
// Any request to '/api/users' will be handled by userRoutes
app.use('/api/users', userRoutes);
// Tell Express to use our user routes
app.use('/api/users', userRoutes); 

// ** Add the booking route here **
app.use('/api/bookings', bookingRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
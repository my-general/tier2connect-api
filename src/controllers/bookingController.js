const { bookingsContainer, usersContainer } = require('../database');
const { v4: uuidv4 } = require('uuid');

// --- Helper: Find Providers for a Service/City ---
const findMatchingProviders = async (serviceId, city) => {
  // 1. Cosmos DB Query Language (SQL API) to find providers:
  //    - whose role is 'provider'
  //    - who are in the specified 'city'
  //    - who offer the specified 'serviceId'
  const querySpec = {
    query: `
      SELECT * FROM users u 
      WHERE u.role = @role 
      AND u.city = @city 
      AND ARRAY_CONTAINS(u.profile.servicesOffered, @serviceId)
      AND u.profile.availabilityStatus = 'available'
    `,
    parameters: [
      { name: "@role", value: "provider" },
      { name: "@city", value: city },
      { name: "@serviceId", value: serviceId }
    ]
  };

  // Execute the query
  const { resources: providers } = await usersContainer.items
    .query(querySpec)
    .fetchAll();

  return providers;
};


// --- Main: Create Booking Controller ---
const createBooking = async (req, res) => {
  // In a real app, the client's ID would come from an Auth Token (Azure AD B2C)
  // For now, we take it from the body and assume a 'client' role.
  const { clientId, serviceId, scheduledTime, address, problemDescription, city } = req.body;

  // Basic Input Validation
  if (!clientId || !serviceId || !scheduledTime || !address || !city) {
    return res.status(400).json({ message: "Missing required booking fields." });
  }

  try {
    // 1. Find a matching provider
    const matchingProviders = await findMatchingProviders(serviceId, city);

    if (matchingProviders.length === 0) {
      return res.status(404).json({ message: "No available providers found for this service in your area." });
    }

    // 2. Simple Assignment Logic: Pick the first available provider (Can be improved later)
    const assignedProvider = matchingProviders[0];

    // 3. Construct the new Booking document
    const newBooking = {
      id: `b_uuid-${uuidv4()}`,
      clientId: clientId, // The client who made the booking
      providerId: assignedProvider.id, // The provider we just assigned
      serviceId: serviceId,
      bookingStatus: "pending", // Initial status
      address: address,
      problemDescription: problemDescription,
      city: city, 
      scheduledTime: scheduledTime,
      createdAt: new Date().toISOString(),
      logs: [{ 
        timestamp: new Date().toISOString(), 
        status: "pending", 
        actor: "system" 
      }],
      payment: {
        estimatedPrice: 500, // Placeholder price (could come from service doc)
        finalPrice: null,
        status: "pending"
      },
      reviewId: null
    };

    // 4. Save the new booking to the 'bookings' container
    // We specify the Partition Key here: newBooking.clientId
    const { resource: createdBooking } = await bookingsContainer.items.create(newBooking, newBooking.clientId);

    // 5. Success response
    res.status(201).json({ 
      message: "Booking successfully created and assigned!", 
      booking: createdBooking,
      assignedProviderName: assignedProvider.name
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error during booking creation." });
  }
};


// --- Get Bookings for a User ---
const getBookingsByUser = async (req, res) => {
  // In a real app, this ID would come from the auth token, 
  // but for testing, we take it from the URL parameter.
  const userId = req.params.userId; 
  const userRole = req.query.role || 'client'; // Expecting 'client' or 'provider'

  // Cosmos DB Query Language (SQL API) to get bookings:
  // We use the same query for both Client and Provider, just checking a different field.
  const queryField = userRole === 'client' ? 'clientId' : 'providerId';

  const querySpec = {
    query: `SELECT * FROM bookings b WHERE b.${queryField} = @userId ORDER BY b.scheduledTime DESC`,
    parameters: [
      { name: "@userId", value: userId }
    ]
  };

  try {
    // 1. Query the 'bookings' container. 
    // CRITICAL FIX: We pass the userId as the Partition Key inside an options object!
    const { resources: bookings } = await bookingsContainer.items
      .query(querySpec, { partitionKey: userId }) // <-- CORRECTED LINE
      .fetchAll();

    if (bookings.length === 0) {
      return res.status(200).json([]); // Return an empty array, not a 404
    }

    // 2. Format the output (only return necessary fields)
    const formattedBookings = bookings.map(b => ({
        id: b.id,
        serviceId: b.serviceId,
        status: b.bookingStatus,
        scheduledTime: b.scheduledTime,
        address: b.address.address,
        // Include the ID of the other party for the frontend:
        // Client sees the Provider's ID; Provider sees the Client's ID.
        otherPartyId: userRole === 'client' ? b.providerId : b.clientId, 
    }));


    res.status(200).json(formattedBookings);

  } catch (error) {
    console.error(`Error fetching bookings for ${userId}:`, error);
    res.status(500).json({ message: "Internal server error fetching bookings." });
  }
};

// --- Export the two functions ---
module.exports = {
  createBooking,
  getBookingsByUser,
};

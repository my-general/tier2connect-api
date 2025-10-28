// Import just the container we need from our database module
const { servicesContainer } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Controller function to GET all services
const getAllServices = async (req, res) => {
  try {
    // Cosmos DB query to get all items
    const { resources: services } = await servicesContainer.items
      .readAll()
      .fetchAll();
    
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error });
  }
};

// Controller function to CREATE a new service
const createService = async (req, res) => {
  try {
    // Get the service data from the request body
    // (e.g., { name: "Plumbing", category: "Home Repair" })
    const { name, category, description } = req.body;

    // Create a new item object with a unique ID
    const newService = {
      id: `svc_${uuidv4()}`, // We use a prefix 'svc_'
      name,
      category,
      description,
    };

    // Save the new item to the database
    const { resource: createdService } = await servicesContainer.items.create(newService);

    res.status(201).json(createdService); // 201 = "Created"
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error });
  }
};

// Export the functions
module.exports = {
  getAllServices,
  createService,
};
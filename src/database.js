const { CosmosClient } = require("@azure/cosmos");
const dotenv = require("dotenv");

dotenv.config();

// Get connection string from .env
const connectionString = process.env.COSMOS_CONNECTION_STRING;
if (!connectionString) {
  throw new Error("COSMOS_CONNECTION_STRING is not defined in .env file");
}

// Connect to Cosmos DB
const client = new CosmosClient(connectionString);
const database = client.database('tier2db');

// Get references to our containers
const usersContainer = database.container('users');
const servicesContainer = database.container('services');
const bookingsContainer = database.container('bookings');

console.log("Database module initialized.");

// Export the containers for use in our controllers
module.exports = {
  usersContainer,
  servicesContainer,
  bookingsContainer,
};
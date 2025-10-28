// Import the container we need from our database module
const { usersContainer } = require('../database');

/**
 * Retrieves a single user (client or provider) by their ID from the database.
 * @param {string} userId - The unique ID of the user (e.g., p_uuid-123 or c_uuid-456).
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id; // Get the ID from the URL parameter

    // Read the item (document) from the container. 
    // We use the ID and Partition Key (/id) for an efficient read.
    const { resource: user } = await usersContainer.item(userId, userId).read();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // For security and simplicity, we don't return every field directly.
    // We explicitly pick and choose what the client app needs to see.
    const publicProfile = {
        id: user.id,
        role: user.role,
        name: user.name,
        city: user.city,
        rating: user.profile.rating || 0,
        totalRatings: user.profile.totalRatings || 0,
        bio: user.profile.bio || "No bio provided.",
        servicesOffered: user.profile.servicesOffered || [],
        profilePicUrl: user.profile.profilePicUrl
    };

    res.status(200).json(publicProfile);

  } catch (error) {
    // A 404 error is often thrown by Cosmos DB if the item is not found
    if (error.code === 404) {
        return res.status(404).json({ message: "User not found." });
    }
    res.status(500).json({ message: "Error fetching user details.", error });
  }
};

// Export the function
module.exports = {
  getUserById,
};
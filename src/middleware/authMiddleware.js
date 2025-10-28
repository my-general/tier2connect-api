// This function simulates checking a JWT token issued by Azure AD B2C.
// In a real application, you would use a library like 'passport-azure-ad' 
// to validate the token's signature, expiry, and issuer.
const mockAuth = (req, res, next) => {
  // 1. Look for a custom header named 'x-user-id'
  const userId = req.header('x-user-id');

  // 2. Check if the ID is provided
  if (!userId) {
    // If no ID, deny access. This is equivalent to an invalid/missing JWT.
    return res.status(401).json({ message: "Access Denied. Please provide 'x-user-id' header." });
  }

  // 3. Simple ID validation (e.g., must start with c_uuid or p_uuid)
  if (!userId.startsWith('c_uuid-') && !userId.startsWith('p_uuid-')) {
    return res.status(401).json({ message: "Invalid User ID format in header." });
  }

  // 4. If validated, attach the userId to the request object.
  // This makes the ID available to our controllers (e.g., req.userId).
  req.userId = userId;

  // 5. Move on to the next function (the controller)
  next();
};

module.exports = {
  mockAuth,
};
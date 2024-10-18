import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';  // Importing the User model

// Middleware function to authenticate users via JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Retrieve the token from the Authorization header
    const token = req.header('Authorization').replace('Bearer ', '');

    // Verify the token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with this token
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    // If no user is found, authentication fails
    if (!user) {
      throw new Error('Authentication failed');
    }

    // Attach token and user to request object for use in the route handlers
    req.token = token;
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    // If any error occurs, respond with 401 Unauthorized status
    res.status(401).send({ message: 'Please authenticate.' });
  }
};

// Middleware function for role-based authorization
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if the authenticated user's role is in the allowedRoles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send({ message: 'Access denied. Insufficient permissions.' });
      }

      // If the user has the required role, proceed to the next middleware or route handler
      next();
    } catch (error) {
      res.status(403).send({ message: 'Access denied.' });
    }
  };
};

export { authMiddleware, roleAuth };

import express from 'express';
import {
  registerUser,
  loginUser,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  forgotPassword,
  resetPassword,
  logoutUser,
  getUserProfile,
} from '../controllers/userControllers.js';  // Import user controller functions
import { authMiddleware, roleAuth } from '../middleware/auth.js';  // Auth and role-based middleware
import { loginLimiter } from '../models/userModel.js';  // Rate limiter for login

const router = express.Router();

// **User registration route**
router.post('/register', registerUser);

// **User login route with rate limiter**
router.post('/login', loginLimiter, loginUser);

// **Enable Two-Factor Authentication**
router.post('/enable-2fa', authMiddleware, enableTwoFactorAuth);

// **Disable Two-Factor Authentication**
router.post('/disable-2fa', authMiddleware, disableTwoFactorAuth);

// **Forgot password (request password reset)**
router.post('/forgot-password', forgotPassword);

// **Reset password using token**
router.post('/reset-password/:token', resetPassword);

// **Logout route**
router.post('/logout', authMiddleware, logoutUser);

// **Get user profile (protected route)**
router.get('/me', authMiddleware, getUserProfile);

// **Admin-only route**
router.get('/admin-dashboard', authMiddleware, roleAuth(['admin']), (req, res) => {
  res.send('Welcome to Admin Dashboard');
});

// **Trainer-only route**
router.get('/trainer-dashboard', authMiddleware, roleAuth(['trainer']), (req, res) => {
  res.send('Welcome to Trainer Dashboard');
});

// Export the router
export default router;




























// // Imported Required Framework And Module and created Express Router Instance
// const express = require("express");
// const router = express.Router();
// const userController = require("../controllers/userControllers");

// // All User Routes
// router.get("/user-status", userController.status);
// router.post("/user-signup", userController.signup);
// router.post("/user-login", userController.login);
// router.post("/user-logout", userController.logout);
// // router.put("/add-to-cart-only/:productId", userController.addToCartOnly);
// // router.put("/add-to-cart/:productId", userController.addToCart);
// // router.get("/cart", userController.getCart);
// // router.delete("/remove/:productId", userController.removeFromCart);
// // router.get("/totalamount", userController.totalamount);
// // router.put("/add-to-wishlist/:productId", userController.addToWishList);
// // router.get("/wishlist", userController.getWishList);
// // router.delete("/removefromwishlist/:productId", userController.removeFromWishList);
// // router.get("/viewprofile", userController.viewprofile);
// // router.get("/viewprofile/:userId", userController.view);
// // router.put("/user-update", userController.update);
// // router.delete("/delete-account", userController.deleteUser);
// // router.put("/clearCart", userController.clearCart);
// // router.get("/orderPlaced", userController.orderPlaced);

// // Exporting Router
// module.exports = router;

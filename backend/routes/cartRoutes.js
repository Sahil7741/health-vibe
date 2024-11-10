const express = require("express");
const router = express.Router();

const {
  addItemToCart,
  getCartItemById,
  getCartByEmail,
  removeItemFromCart,
} = require("../controllers/cartController");

const { verifyJWT } = require("../middleware/authMiddleware");

router.post('/add-to-cart', verifyJWT, addItemToCart);
router.get('/cart-item/:id', verifyJWT, getCartItemById);
router.get('/cart/:email', verifyJWT, getCartByEmail);
router.delete('/delete-cart-item/:id', verifyJWT, removeItemFromCart);

module.exports = router;

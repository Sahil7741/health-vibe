const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  deleteUser,
  updateUser,
} = require("../controllers/userController");

const { verifyJWT, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/user/:email", verifyJWT, getUserByEmail);
router.delete("/delete-user/:id", verifyJWT, verifyAdmin, deleteUser);
router.put("/update-user/:id", verifyJWT, verifyAdmin, updateUser);

module.exports = router;

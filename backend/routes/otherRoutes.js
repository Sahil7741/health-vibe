const express = require("express");
const router = express.Router();

const {
  getPopularClasses,
  getPopularInstructors,
  getInstructors,
  getAdminStats,
  getEnrolledClasses,
  addInstructor,
  getAppliedInstructors
} = require("../controllers/otherController");

const { verifyJWT, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/popular_classes", getPopularClasses);
router.get("/popular-instructors", getPopularInstructors);
router.get("/instructors", getInstructors);
router.get('/admin-stats', verifyJWT, verifyAdmin, getAdminStats);
router.get('/enrolled-classes/:email', verifyJWT, getEnrolledClasses);
router.post('/as-instructor', addInstructor);
router.get('/applied-instructors/:email', getAppliedInstructors);

module.exports = router;

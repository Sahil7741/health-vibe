const express = require("express");
const router = express.Router();

const {
  createClass,
  getAllClassesAddedByInstructor,
  getAllClasses,
  classesManage,
  changeStatus,
  getApprovedClasses,
  updateClass,
  getClassById,
} = require("../controllers/classController");

const {
  verifyJWT,
  verifyAdmin,
  verifyInstructor,
} = require("../middleware/authMiddleware");

router.post("/new-class", verifyJWT, verifyInstructor, createClass);
router.get("/classes/:email", verifyJWT, verifyInstructor, getAllClassesAddedByInstructor);
router.get("/classes", getAllClasses);
router.get("/classes-manage", classesManage);
router.put("/change-status/:id", verifyJWT, verifyAdmin, changeStatus);
router.get("/approved-classes", getApprovedClasses);
router.put("/update-class/:id", verifyJWT, verifyInstructor, updateClass);
router.get("/class/:id", getClassById);

module.exports = router;

const classesCollection = require("../models/Class");
const userCollection = require("../models/User");
const enrolledCollection = require("../models/Enrolled");
const appliedCollection = require("../models/Applied");

const { ObjectId } = require("mongodb");

const getPopularClasses = async (req, res) => {
  const result = await classesCollection
    .find()
    .sort({ totalEnrolled: -1 })
    .limit(6)
    .toArray();
  res.send(result);
};

const getPopularInstructors = async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$instructorEmail",
        totalEnrolled: { $sum: "$totalEnrolled" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "email",
        as: "instructor",
      },
    },
    {
      $project: {
        _id: 0,
        instructor: {
          $arrayElemAt: ["$instructor", 0],
        },
        totalEnrolled: 1,
      },
    },
    {
      $sort: {
        totalEnrolled: -1,
      },
    },
    {
      $limit: 6,
    },
  ];
  const result = await classesCollection.aggregate(pipeline).toArray();
  res.send(result);
};

const getInstructors = async (req, res) => {
  const query = { role: "instructor" };
  const result = await userCollection.find(query).toArray();
  res.send(result);
};

const getAdminStats = async (req, res) => {
  // Get approved classes and pending classes and instructors 
  const approvedClasses = (await classesCollection.find({ status: 'approved' }).toArray()).length;
  const pendingClasses = (await classesCollection.find({ status: 'pending' }).toArray()).length;
  const instructors = (await userCollection.find({ role: 'instructor' }).toArray()).length;
  const totalClasses = (await classesCollection.find().toArray()).length;
  const totalEnrolled = (await enrolledCollection.find().toArray()).length;
  // const totalRevenue = await paymentCollection.find().toArray();
  // const totalRevenueAmount = totalRevenue.reduce((total, current) => total + parseInt(current.price), 0);
  const result = {
      approvedClasses,
      pendingClasses,
      instructors,
      totalClasses,
      totalEnrolled,
      // totalRevenueAmount
  }
  res.send(result);

};

const getEnrolledClasses = async (req, res) => {
  const email = req.params.email;
  const query = { userEmail: email };
  const pipeline = [
      {
          $match: query
      },
      {
          $lookup: {
              from: "classes",
              localField: "classesId",
              foreignField: "_id",
              as: "classes"
          }
      },
      {
          $unwind: "$classes"
      },
      {
          $lookup: {
              from: "users",
              localField: "classes.instructorEmail",
              foreignField: "email",
              as: "instructor"
          }
      },
      {
          $project: {
              _id: 0,
              classes: 1,
              instructor: {
                  $arrayElemAt: ["$instructor", 0]
              }
          }
      }

  ]
  const result = await enrolledCollection.aggregate(pipeline).toArray();
  // const result = await enrolledCollection.find(query).toArray();
  res.send(result);
};

const addInstructor = async (req, res) => {
  const data = req.body;
  const result = await appliedCollection.insertOne(data);
  res.send(result);
};

const getAppliedInstructors =    async (req, res) => {
  const email = req.params.email;
  const result = await appliedCollection.findOne({email});
  res.send(result);
};

module.exports = {
  getPopularClasses,
  getPopularInstructors,
  getInstructors,
  getAdminStats,
  getEnrolledClasses,
  addInstructor,
  getAppliedInstructors
};

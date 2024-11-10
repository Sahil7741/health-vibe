const paymentCollection = require("../models/Payment");
const classesCollection = require("../models/Class");
const enrolledCollection = require("../models/Enrolled");
const cartCollection = require("../models/Cart");
const stripe = require("stripe")(process.env.PAYMENT_SECRET);
const { ObjectId } = require("mongodb");

const createPaymentIntent = async (req, res) => {
  const { price } = req.body;
  const amount = parseInt(price) * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    payment_method_types: ["card"],
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};

const paymentInfo = async (req, res) => {
  const paymentInfo = req.body;
  const classesId = paymentInfo.classesId;
  const userEmail = paymentInfo.userEmail;
  const singleClassId = req.query.classId;
  let query;
  // const query = { classId: { $in: classesId } };
  if (singleClassId) {
    query = { classId: singleClassId, userMail: userEmail };
  } else {
    query = { classId: { $in: classesId } };
  }
  const classesQuery = {
    _id: { $in: classesId.map((id) => new ObjectId(id)) },
  };
  const classes = await classesCollection.find(classesQuery).toArray();
  const newEnrolledData = {
    userEmail: userEmail,
    classesId: classesId.map((id) => new ObjectId(id)),
    transactionId: paymentInfo.transactionId,
  };
  const updatedDoc = {
    $set: {
      totalEnrolled:
        classes.reduce((total, current) => total + current.totalEnrolled, 0) +
          1 || 0,
      availableSeats:
        classes.reduce((total, current) => total + current.availableSeats, 0) -
          1 || 0,
    },
  };
  // const updatedInstructor = await userCollection.find()
  const updatedResult = await classesCollection.updateMany(
    classesQuery,
    updatedDoc,
    { upsert: true }
  );
  const enrolledResult = await enrolledCollection.insertOne(newEnrolledData);
  const deletedResult = await cartCollection.deleteMany(query);
  const paymentResult = await paymentCollection.insertOne(paymentInfo);
  res.send({ paymentResult, deletedResult, enrolledResult, updatedResult });
};

const getPaymentHistory = async (req, res) => {
  const email = req.params.email;
  const query = { userEmail: email };
  const result = await paymentCollection
    .find(query)
    .sort({ date: -1 })
    .toArray();
  res.send(result);
};

const getPaymentHistoryLength = async (req, res) => {
  const email = req.params.email;
  const query = { userEmail: email };
  const total = await paymentCollection.countDocuments(query);
  res.send({ total });
};

module.exports = {
  createPaymentIntent,
  paymentInfo,
  getPaymentHistory,
  getPaymentHistoryLength,
};

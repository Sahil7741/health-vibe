const classesCollection = require('../models/Class');
const { ObjectId } = require('mongodb');

const createClass = async (req, res) => {
  const newClass = req.body;
  newClass.availableSeats = parseInt(newClass.availableSeats)
  const result = await classesCollection.insertOne(newClass);
  res.send(result);
};

const getAllClassesAddedByInstructor = async (req, res) => {
  const email = req.params.email;
  const query = { instructorEmail: email };
  const result = await classesCollection.find(query).toArray();
  res.send(result);
};

const getAllClasses = async (req, res) => {
  const query = { status: 'approved' };
  const result = await classesCollection.find(query).toArray();
  res.send(result);
};

const classesManage = async (req, res) => {
  const result = await classesCollection.find().toArray();
  res.send(result);
};

const changeStatus = async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  console.log(req.body)
  const reason = req.body.reason;
  const filter = { _id: new ObjectId(id) };
  console.log("🚀 ~ file: index.js:180 ~ app.put ~ reason:", reason)
  const options = { upsert: true };
  const updateDoc = {
      $set: {
          status: status,
          reason: reason
      }
  }
  const result = await classesCollection.updateOne(filter, updateDoc, options);
  res.send(result);
};

const getApprovedClasses = async (req, res) => {
  const query = { status: 'approved' };
  const result = await classesCollection.find(query).toArray();
  res.send(result);
};

const updateClass = async (req, res) => {
  const id = req.params.id;
  const updatedClass = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
      $set: {
          name: updatedClass.name,
          description: updatedClass.description,
          price: updatedClass.price,
          availableSeats: parseInt(updatedClass.availableSeats),
          videoLink: updatedClass.videoLink,
          status: 'pending'
      }
  }
  const result = await classesCollection.updateOne(filter, updateDoc, options);
  res.send(result);
};

const getClassById = async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await classesCollection.findOne(query);
  res.send(result);
};

module.exports = {
  createClass,
  getAllClassesAddedByInstructor,
  getAllClasses,
  classesManage,
  changeStatus,
  getApprovedClasses,
  updateClass,
  getClassById
};
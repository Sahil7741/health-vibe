const userCollection = require("../models/User");
const { ObjectId } = require("mongodb");

const getAllUsers = async (req, res) => {
  const users = await userCollection.find({}).toArray();
  res.send(users);
};

const getUserById = async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await userCollection.findOne(query);
  res.send(user);
};

const getUserByEmail = async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const result = await userCollection.findOne(query);
  res.send(result);
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await userCollection.deleteOne(query);
  res.send(result);
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.option,
      address: updatedUser.address,
      phone: updatedUser.phone,
      about: updatedUser.about,
      photoUrl: updatedUser.photoUrl,
      skills: updatedUser.skills ? updatedUser.skills : null,
    },
  };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  res.send(result);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  deleteUser,
  updateUser,
};

const cartCollection = require("../models/Cart");
const classesCollection = require("../models/Class");
const { ObjectId } = require("mongodb");

const addItemToCart = async (req, res) => {
  const newCartItem = req.body;
  const result = await cartCollection.insertOne(newCartItem);
  res.send(result);
};

const getCartItemById = async (req, res) => {
  const id = req.params.id;
  const email = req.query.email;
  const query = { classId: id, userMail: email };
  const projection = { classId: 1 };
  const result = await cartCollection.findOne(query, { projection: projection });
  res.send(result);
};

const getCartByEmail = async (req, res) => {
  const email = req.params.email;
  const query = { userMail: email };
  const projection = { classId: 1 };
  const carts = await cartCollection.find(query, { projection: projection }).toArray();
  const classIds = carts.map(cart => new ObjectId(cart.classId));
  const query2 = { _id: { $in: classIds } };
  const result = await classesCollection.find(query2).toArray();
  res.send(result);
};

const removeItemFromCart = async (req, res) => {
  const id = req.params.id;
  const query = { classId: id };
  const result = await cartCollection.deleteOne(query);
  res.send(result);
};

module.exports = {
  addItemToCart,
  getCartItemById,
  getCartByEmail,
  removeItemFromCart,
};
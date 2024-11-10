const { client } = require('../config/db');

const database = client.db("yoga_master");

const cartCollection = database.collection("cart");

module.exports = cartCollection;

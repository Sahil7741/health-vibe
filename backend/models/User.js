const { client } = require('../config/db');

const database = client.db("yoga_master");
const userCollection = database.collection("users");

module.exports = userCollection;

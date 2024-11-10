const { client } = require('../config/db');

const database = client.db("yoga_master");

const paymentCollection = database.collection("payments");

module.exports = paymentCollection;

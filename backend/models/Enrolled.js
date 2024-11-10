const { client } = require('../config/db');

const database = client.db("yoga_master");

const enrolledCollection = database.collection("enrolled");

module.exports = enrolledCollection;

const { client } = require('../config/db');

const database = client.db("yoga_master");

const appliedCollection = database.collection("applied");

module.exports = appliedCollection;

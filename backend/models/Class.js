const { client } = require('../config/db');

const database = client.db("yoga_master");

const classesCollection = database.collection("classes");

module.exports = classesCollection;

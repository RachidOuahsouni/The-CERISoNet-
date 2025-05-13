const { MongoClient, ObjectId } = require("mongodb");
const mongoUrl = 'mongodb://pedago01C.univ-avignon.fr:27017';
const dbName = 'db-CERI';

module.exports = {
  MongoClient,
  ObjectId,
  mongoUrl,
  dbName
};
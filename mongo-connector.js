//Inizialize Mongo Library
const {MongoClient} = require('mongodb');

//Define MONGO Url
const MONGO_URL = 'mongodb://localhost:27017/db';

module.exports = async () => {
  //Connect to MongoDB with Url after defined
  const db = await MongoClient.connect(MONGO_URL);
  return {
    //Return list of entries
    Links: db.collection('links')
  };
}

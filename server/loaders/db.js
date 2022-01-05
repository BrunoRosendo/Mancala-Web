const { MongoClient } = require("mongodb");
const config = require("../config/env");

let client;

module.exports = async () => {
  if (!client) {
    try {
      client = new MongoClient(config.db_url);
      await client.connect();
    } catch (err) {
      console.error("Failed in connecting to MongoDB server (aborting)", err);
      process.exit(1);
    }
    
    console.log("Successfully connected to MongoDB server");
  }
  return client.db(config.db_name);
}

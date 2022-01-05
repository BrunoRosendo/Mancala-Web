const { MongoClient } = require("mongodb");

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 27018;

const url = `mongodb://${dbHost}:${dbPort}`;
const client = new MongoClient(url);

const dbName = 'mancala-db';

const connect = async () => {
  await client.connect();
  console.log("Successfully connected to MongoDB server");
  return client.db(dbName);
}

module.exports = { connect };

const { MongoClient } = require("mongodb");

const databaseUrl = process.env.MONGO_URL;
const client = new MongoClient(databaseUrl);

let database;

async function connectDatabase() {
  try {
    await client.connect();
    console.log("Connected to the Sblogs");
    database = client.db("Sblogs");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}
function getDatabase() {
  return database;
}

module.exports = {
  connectDatabase,
  getDatabase,
};

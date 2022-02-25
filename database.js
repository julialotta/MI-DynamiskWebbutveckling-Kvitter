const { MongoClient } = require("mongodb");

async function getDb() {
  const client = new MongoClient(process.env.CONNECTION_STRING);
  await client.connect();

  const db = client.db("kvitter");

  return db;
}

module.exports = {
  getDb,
};

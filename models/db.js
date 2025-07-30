const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const url = process.env.DB_URL;

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  await client.connect();
  console.log("✅ Connected to MongoDB");
  return client.db("book-management");
};

module.exports = { connectDB, client };

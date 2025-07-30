const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { client } = require("./models/db");
const bookRoutes = require("./routes/bookRoutes");

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("📚 Book Management System API!");
});

// Use book routes
app.use("/books", bookRoutes);

app.listen(port, async () => {
  try {
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged MongoDB! Server is running on port", port);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
});

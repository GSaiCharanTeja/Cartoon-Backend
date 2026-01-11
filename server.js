const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection (IMPORTANT: include database name)
mongoose.connect(
  process.env.MONGO_URI ||
    "mongodb+srv://anything:save@cluster0.e0lxlj2.mongodb.net/test",
  {
    serverSelectionTimeoutMS: 5000,
  }
);

// 🔹 Schema
const LikeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

const Like = mongoose.model("Like", LikeSchema);

// 🔹 Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 🔹 Like API (FIXED & NORMALIZED)
app.post("/like", async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    name = name.toLowerCase().trim(); // ⭐ FIX

    const result = await Like.findOneAndUpdate(
      { name },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Admin API
app.get("/admin", async (req, res) => {
  const data = await Like.find({}, { _id: 0, name: 1, count: 1 });
  res.json(data);
});

// 🔹 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

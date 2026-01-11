const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection
mongoose.connect(process.env.MONGO_URI || "YOUR_MONGO_ATLAS_URL", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 🔹 Schema (IMPORTANT)
const LikeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

const Like = mongoose.model("Like", LikeSchema);

// 🔹 Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 🔹 Like API (FIXED)
app.post("/like", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const result = await Like.findOneAndUpdate(
    { name },
    { $inc: { count: 1 }, $setOnInsert: { name } },
    { upsert: true, new: true }
  );

  res.json(result);
});

// 🔹 Admin API
app.get("/admin", async (req, res) => {
  const data = await Like.find({}, { _id: 0, name: 1, count: 1 });
  res.json(data);
});

// 🔹 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

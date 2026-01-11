const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 MongoDB connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://anything:save@cluster0.e0lxlj2.mongodb.net/test"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// 🔹 Schema
const LikeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Like = mongoose.model("Like", LikeSchema);

// 🔹 Health check
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// 🔹 Like API (FINAL & CORRECT)
app.post("/like", async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // 🔥 normalize input
    name = name.toLowerCase().trim();

    const result = await Like.findOneAndUpdate(
      { name },
      { $inc: { count: 1 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      name: result.name,
      count: result.count,
    });
  } catch (err) {
    console.error("LIKE API ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Admin API
app.get("/admin", async (req, res) => {
  try {
    const data = await Like.find({}, { _id: 0, name: 1, count: 1 }).sort({
      name: 1,
    });
    res.json(data);
  } catch (err) {
    console.error("ADMIN API ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

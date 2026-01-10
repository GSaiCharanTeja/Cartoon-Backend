const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas connection (from Render env variable)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Schema
const LikeSchema = new mongoose.Schema({
  name: String,
  count: {
    type: Number,
    default: 0,
  },
});

const Like = mongoose.model("Like", LikeSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Like API
app.post("/like", async (req, res) => {
  const { name } = req.body;

  await Like.findOneAndUpdate(
    { name },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );

  res.json({ success: true });
});

// Admin API (only you should use this)
app.get("/admin", async (req, res) => {
  const data = await Like.find();
  res.json(data);
});

// Start server (Render uses PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

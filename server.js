const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// TEMP local DB (will change later)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Model
const Like = mongoose.model("Like", {
  name: String,
  count: { type: Number, default: 0 }
});

// Like route
app.post("/like", async (req, res) => {
  const { name } = req.body;

  await Like.findOneAndUpdate(
    { name },
    { $inc: { count: 1 } },
    { upsert: true }
  );

  res.send("Liked");
});

// Admin route
app.get("/admin", async (req, res) => {
  const data = await Like.find();
  res.json(data);
});

// Start server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Like = require("./models/Like");

const app = express();

/* 🔹 Middlewares */
app.use(cors());              // allow Netlify
app.use(express.json());      // read JSON body

/* 🔹 MongoDB connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* 🔹 Test route */
app.get("/", (req, res) => {
  res.send("Cartoon Backend is running");
});

/* 🔹 LIKE API (used by frontend) */
app.post("/api/like", async (req, res) => {
  try {
    const { user, image } = req.body;

    if (!user || !image) {
      return res.status(400).json({ error: "Missing data" });
    }

    // Optional: prevent same user liking same image twice
    const alreadyLiked = await Like.findOne({ user, image });
    if (alreadyLiked) {
      return res.status(409).json({ error: "Already liked" });
    }

    await Like.create({ user, image });

    res.json({ message: "Like saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* 🔹 ADMIN: get all likes */
app.get("/api/admin/likes", async (req, res) => {
  try {
    const likes = await Like.find().sort({ createdAt: -1 });
    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* 🔹 Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

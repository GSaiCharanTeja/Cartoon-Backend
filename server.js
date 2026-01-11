const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- MONGODB CONNECTION ---------------- */
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://anything:save@cluster0.e0lxlj2.mongodb.net/test"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ---------------- SCHEMA ---------------- */
const LikeSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

// prevent same user liking same image twice
LikeSchema.index({ user: 1, image: 1 }, { unique: true });

const Like = mongoose.model("Like", LikeSchema);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

/* ==================================================
   LIKE API (USED BY FRONTEND)
   METHOD: POST
   BODY: { user, image }
================================================== */
app.post("/api/like", async (req, res) => {
  try {
    let { user, image } = req.body;

    if (!user || !image) {
      return res.status(400).json({ error: "User and image are required" });
    }

    user = user.trim().toLowerCase();
    image = image.trim().toLowerCase();

    const alreadyLiked = await Like.findOne({ user, image });
    if (alreadyLiked) {
      return res.status(409).json({ error: "Already liked" });
    }

    await Like.create({ user, image });

    res.json({
      success: true,
      message: "Like saved",
      user,
      image
    });
  } catch (err) {
    console.error("❌ LIKE API ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ==================================================
   ADMIN API (VIEW ALL LIKES)
   METHOD: GET
================================================== */
app.get("/api/admin", async (req, res) => {
  try {
    const data = await Like.find(
      {},
      { _id: 0, user: 1, image: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("❌ ADMIN API ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

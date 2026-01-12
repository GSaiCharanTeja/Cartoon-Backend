const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   MONGODB CONNECTION
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ===============================
   SCHEMA
================================ */
const LikeSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

/* One user can like one image only once */
LikeSchema.index({ user: 1, image: 1 }, { unique: true });

const Like = mongoose.model("Like", LikeSchema);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* ===============================
   LIKE IMAGE API
   BODY: { user, image }
================================ */
app.post("/api/like", async (req, res) => {
  try {
    let { user, image } = req.body;

    if (!user || !image) {
      return res.status(400).json({ error: "User and image required" });
    }

    user = user.trim().toLowerCase();
    image = image.trim().toLowerCase();

    await Like.create({ user, image });

    res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already liked" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   ADMIN: ALL LIKES
================================ */
app.get("/api/admin", async (req, res) => {
  const data = await Like.find({}, { _id: 0 }).sort({ createdAt: -1 });
  res.json(data);
});

/* ===============================
   ADMIN: IMAGE → USERS
================================ */
app.get("/api/admin/image/:image", async (req, res) => {
  const image = req.params.image.toLowerCase();

  const likes = await Like.find(
    { image },
    { _id: 0, user: 1 }
  );

  res.json({
    image,
    totalLikes: likes.length,
    users: likes.map(l => l.user)
  });
});

/* ===============================
   ADMIN: SUMMARY (IMAGE COUNTS)
================================ */
app.get("/api/admin/summary", async (req, res) => {
  const data = await Like.aggregate([
    { $group: { _id: "$image", count: { $sum: 1 } } },
    { $project: { _id: 0, image: "$_id", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  res.json(data);
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

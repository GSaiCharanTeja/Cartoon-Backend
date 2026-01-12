const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGO_URI ||
  "mongodb+srv://anything:save@cluster0.e0lxlj2.mongodb.net/cartoon"
)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

const LikeSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    image: { type: String, required: true }
  },
  { timestamps: true }
);

LikeSchema.index({ user: 1, image: 1 }, { unique: true });

const Like = mongoose.model("Like", LikeSchema);

app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

app.post("/api/like", async (req, res) => {
  try {
    let { user, image } = req.body;
    if (!user || !image) {
      return res.status(400).json({ error: "User and image required" });
    }

    user = user.toLowerCase().trim();
    image = image.toLowerCase().trim();

    await Like.create({ user, image });

    res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Already liked" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/admin", async (req, res) => {
  const data = await Like.find({}, { _id: 0 }).sort({ createdAt: -1 });
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));

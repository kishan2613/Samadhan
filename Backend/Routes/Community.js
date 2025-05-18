const express = require("express");
const router = express.Router();
const Community = require("../Models/Community");

// Create a community message
router.post("/", async (req, res) => {
  try {
    const { sender, topic, content } = req.body;
    const newCommunity = new Community({ sender, topic, content });
    await newCommunity.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all community messages with sender info
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });

    res.json(communities); // ✅ Use correct variable
  } catch (err) {
    console.error("Error fetching community messages:", err);
    res.status(500).json({ error: err.message });
  }
});

// Increment likes for a community post
router.post("/:id/like", async (req, res) => {
  try {
    const postId = req.params.id;

    // Atomically increment likes by 1 and return updated document
    const updatedPost = await Community.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(updatedPost);
  } catch (err) {
    console.error("Error updating likes:", err);
    res.status(500).json({ error: "Failed to update likes" });
  }
});


module.exports = router;

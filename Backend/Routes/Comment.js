const express = require("express");
const router = express.Router();
const Comment = require("../Models/Comments");

// Add a comment
router.post("/", async (req, res) => {
  try {
    const {communityId, commenter, commentText } = req.body;
    const comment = new Comment({ communityId, commenter, commentText });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a specific message
router.get("/:communityId", async (req, res) => {
  try {
    const comments = await Comment.find({ communityId: req.params.communityId })
      .populate("commenter", "name email")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

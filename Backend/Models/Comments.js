const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  commenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  likes: Number,
});

module.exports = mongoose.model("Comment", CommentSchema);

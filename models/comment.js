const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema({
  /** What is being commented on: a fit, a shelf post, or an album photo. */
  targetType: {
    type: String,
    required: true,
    enum: ["fit", "post", "gallery"],
  },
  targetId: {
    type: ObjectId,
    required: true,
  },
  author: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);

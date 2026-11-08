const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

/**
 * A shared shelf item (book / song / other) posted to the community feed.
 * The item is snapshotted here — the shelf itself stays client-only, so a
 * shared post keeps its title, cover and link even if the shelf changes.
 */
const postSchema = new mongoose.Schema({
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  kind: {
    type: String,
    required: true,
    enum: ["shelf"],
  },
  shelfType: {
    type: String,
    required: true,
    enum: ["book", "song", "other"],
  },
  title: {
    type: String,
    required: true,
    maxlength: 120,
    trim: true,
  },
  creator: {
    type: String,
    maxlength: 60,
    trim: true,
  },
  coverUrl: {
    type: String,
    maxlength: 2048,
  },
  url: {
    type: String,
    maxlength: 2048,
  },
  note: {
    type: String,
    maxlength: 280,
    trim: true,
  },
  likes: [
    {
      type: ObjectId,
      ref: "User",
      default: [],
    },
  ],
  commentCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);

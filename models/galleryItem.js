const mongoose = require("mongoose");
const validator = require("validator");

const { ObjectId } = mongoose.Schema.Types;

const galleryItemSchema = new mongoose.Schema({
  kind: {
    type: String,
    required: true,
    enum: ["photo", "video"],
  },
  source: {
    type: String,
    required: true,
    enum: ["upload", "link"],
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }),
      message: "You must enter a valid URL",
    },
  },
  // Only present for source: "upload" — the R2 object key, needed so we can
  // delete the actual file from the bucket when the item is deleted.
  key: {
    type: String,
    default: null,
  },
  mimeType: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    maxlength: 60,
    default: "",
  },
  /** Public items show in the Discover feed, where others can like and
   * comment. Private by default — albums stay personal unless shared. */
  isPublic: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      type: ObjectId,
      ref: "User",
      default: [],
    },
  ],
  /** Denormalized comment count, kept in sync by the comment controller. */
  commentCount: {
    type: Number,
    default: 0,
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GalleryItem", galleryItemSchema);

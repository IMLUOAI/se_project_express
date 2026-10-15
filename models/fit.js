const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const fitSchema = new mongoose.Schema({
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      type: ObjectId,
      ref: "ClothingItem",
    },
  ],
  weather: {
    type: String,
    required: true,
    enum: ["hot", "warm", "cold"],
  },
  note: {
    type: String,
    maxlength: 140,
  },
  likes: [
    {
      type: ObjectId,
      ref: "User",
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Fit", fitSchema);

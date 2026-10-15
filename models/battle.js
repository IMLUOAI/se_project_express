const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const battleSchema = new mongoose.Schema({
  fitA: {
    type: ObjectId,
    ref: "Fit",
    required: true,
  },
  fitB: {
    type: ObjectId,
    ref: "Fit",
    required: true,
  },
  createdBy: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  votesA: {
    type: Number,
    default: 0,
  },
  votesB: {
    type: Number,
    default: 0,
  },
  voters: [
    {
      type: ObjectId,
      ref: "User",
      default: [],
    },
  ],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Battle", battleSchema);

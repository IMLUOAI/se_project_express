const mongoose = require("mongoose");
const validator = require("validator");

const { ObjectId } = mongoose.Schema.Types;

const favoriteSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["photo", "video"],
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: (value) => validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }),
      message: "You must enter a valid URL",
    },
  },
  title: {
    type: String,
    minlength: 1,
    maxlength: 60,
    default: "",
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

module.exports = mongoose.model("Favorite", favoriteSchema);

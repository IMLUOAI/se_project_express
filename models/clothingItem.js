const mongoose = require("mongoose");
const validator = require('validator');

const { ObjectId } = mongoose.Schema.Types;

const clothingItemSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },
    weather: {
      type: String,
      required: true,
      enum: ['hot', 'warm', 'cold']
    },
    imageUrl: {
      type: String,
      required: true,
      validate: {
        validator:(value) => validator.isURL(value),
        message: 'You must enter a valid URL',
      }},
    owner: {
      type: ObjectId,
      ref: "User",
      required: true,
      },
    likes: [{
     type: ObjectId,
      ref: 'User',
      default: []
      }],
    createdAt: {
     type: Date,
     default: Date.now
    },
    });

module.exports = mongoose.model("ClothingItem", clothingItemSchema);


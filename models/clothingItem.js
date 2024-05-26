const mongoose = require("mongoose");

const clothingItemSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 30 },
      weather: {
      type: String,
      required: true,
      enum: ['hot', 'warm', 'cold']
    },
    imageUrl: {
      type: String,
      required: true},
    owner: {
      type: ObjectId,

      },
    likes: {
     type: ObjectId,
      ref: 'User',
      default: []
      },
    createAt: {
     type: Date,
     default: Date.now},
    validate: {
      validator(value) {
        return this.validator.isURL(value);
      },
      message: 'You must enter a valid URL',
    }
    });

module.exports = mongoose.model("ClothingItem", clothingItemSchema);


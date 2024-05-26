const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxngtleh: 30,
  },
  avatar: {
    type: String,
    required: true,
  },
  validate: {
    validator(value) {
      return this.validator.isURL(value);
    },
    message: 'You must enter a valid URL',
  }
});
module.exports = mongooose.model("User", userSchema);

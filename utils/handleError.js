const {
  MONGODB_DUPLICATE_ERROR,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  INVALID_ID,
  FORBIDDEN,
} = require("./errors");

module.exports.handleError = (err, res) => {
  if (err.statusCode === NOT_FOUND) {
    return res.status(NOT_FOUND).send({ message: "Item not found" });
  }
  if (err.statusCode === MONGODB_DUPLICATE_ERROR || err.code === 11000) {
    return res
      .status(MONGODB_DUPLICATE_ERROR)
      .send({ message: "Email already exists" });
  }
  if (
    err.statusCode === INVALID_ID ||
    err.message.include("User validation failed")
  ) {
    return res.status(INVALID_ID).send({ message: "Invalid ID" });
  }

  if (err.statusCode === FORBIDDEN) {
    return res
      .status(FORBIDDEN)
      .send({ message: "You are not authorized to delete the item" });
  }
  return res
    .status(INTERNAL_SERVER_ERROR)
    .send({ message: "An error has occured on the server" });
};

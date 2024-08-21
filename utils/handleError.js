const {
  DuplicatedMongodbError,
  NotFoundError,
  BadInternalServerError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError
} = require("./errors");

module.exports.handleError = (err, res) => {
  if (err.statusCode === NotFoundError) {
    return res.status(NotFoundError).send({ message: "Item not found" });
  }
  if (err.statusCode === DuplicatedMongodbError || err.code === 11000) {
    return res
      .status(DuplicatedMongodbError)
      .send({ message: "Email already exists" });
  }
  if (
    err.statusCode === BadRequestError || err.name === "ValidationError"
  ) {
    return res.status(BadRequestError).send({ message: "Invalid ID" });
  }

  if (err.statusCode === ForbiddenError) {
    return res
      .status(ForbiddenError)
      .send({ message: "You are not authorized to delete the item" });
  }
  if (err.statusCode === UnauthorizedError) {
    return res
      .status(UnauthorizedError)
      .send({ message: "Unauthorized user" });
  }
  return res
    .status(BadInternalServerError)
    .send({ message: "An error has occured on the server" });
};


class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

class DuplicatedMongodbError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

class BadInternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}


module.exports = {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  DuplicatedMongodbError,
  BadInternalServerError
}
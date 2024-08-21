
const { BadInternalServerError } = require('../utils/errors')

module.exports =(err, req, res, next) => {
  console.error(err);
  const { statusCode = BadInternalServerError, message } = err;
  res
  .status(statusCode)
  .send({
    message: statusCode === BadInternalServerError
    ? 'An error occured on the server'
    : message
  });
  next(new Error('Authorization error'));
}
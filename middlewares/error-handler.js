
const { BadInternalServerError } = require('../utils/errors')

module.exports =(err, req, res, next) => {
  if(err instanceof BadInternalServerError) {
    return res.status(err.statusCode).send({
      message: err.message
    })
  }

  const { statusCode = 500, message } = err;
  res
  .status(statusCode)
  .send({
    message: statusCode === 500
    ? 'An error occured on the server'
    : message
  });
  next(new Error('Authorization error'));
}
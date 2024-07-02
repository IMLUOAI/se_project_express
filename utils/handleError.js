module.exports.handleError = (err, res) => {
  if (err.statusCode === NOT_FOUND ) {
    return res.status(NOT_FOUND).send({ message: err.message });
  }
  if (err.statusCode === MONGODB_DUPLICATE_ERROR || err.code === 11000) {
    return res.status(409).send({ message: 'Eamil already exists' });
  }
  if (err.statusCode === INVALID_ID ) {
    return res.status(INVALID_ID).send({ message: 'Invalid ID'});
  }
  if (err.statusCode === FORBIDDEN) {
    return res.status(FORBIDDEN).send({ message: 'You are not authorized to delete the item'});
  }
  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'An error has occured on the server'});
}
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    return res
       .status(401)
       .send({ message: 'Authorization required' })
  }
const token = authorization.replace('Bearer ', '');
let payload;

try {
  payload = jwt.verify(token, JWT_SECRET);
} catch (err) {
  return res
  .status(401)
  .send({ message: 'Authorization required' })
}
req.user = payload;

next();
}
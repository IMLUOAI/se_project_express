const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UnauthorizedError } = require("../utils/errors");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log('Authorization header received:', authorization);

  if (!authorization || !authorization.startsWith("Bearer")) {
    return next(new UnauthorizedError("Authorization required"));
  }
  const token = authorization.replace("Bearer ", "");
  let payload;
  console.log('Token extracted:', token);
  try {
   payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
   return next(new UnauthorizedError("Authorization required"));
  }
  req.user = payload;
  next();
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const DuplicatedMongodbError = require('../errors/DuplicatedMongodbError');
const BadInternalServerError = require('../errors/BadInternalServerError');


const { JWT_SECRET } = require("../utils/config");
const { isAdultDob } = require("../utils/age");

// getCurrentUser

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user with matching ID found');
      }
      // The user themself may see their own dob; everyone also gets the
      // derived isAdult flag used by the app's birthday gate.
      const userResponse = user.toObject();
      userResponse.isAdult = isAdultDob(user.dob);
      res.send(userResponse);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("The id is an invalid format"));
      }
      return next(err);
    });
}
// getPublicUser (no auth — public profile card for share links / feeds).
// Only _id, name, avatar are ever selected: email/password can never leak.
module.exports.getPublicUser = (req, res, next) => {
  const { id } = req.params;
  return User.findById(id)
    .select("_id name avatar")
    .orFail(() => {
      throw new NotFoundError("User not found");
    })
    .then((user) => res.status(200).send(user))
    .catch(next);
};
// updateCurrentUser

module.exports.updateCurrentUser = async (req, res, next) => {
  const { name, avatar } = req.body;
  const updateData = { name, avatar };

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return res.send({ data: user });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Validation failed"));
    }
    return next(err);
  }
};

// updateDob — set or change the user's own date of birth (birthday gate).
// Celebrate validation (validateDobUpdate) rejects missing/future/
// unparseable values before this runs.
module.exports.updateDob = async (req, res, next) => {
  const { dob } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { dob },
      { new: true, runValidators: true },
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const userResponse = user.toObject();
    userResponse.isAdult = isAdultDob(user.dob);
    return res.send({ data: userResponse });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Validation failed"));
    }
    return next(err);
  }
};

// createUser

module.exports.createUser = async (req, res, next) => {
  const { email, password, name, avatar, dob } = req.body;
  if (!email || !password || !name || !avatar || !dob) {
    return next(new BadRequestError("Name, email, password, and date of birth are required"));
  }
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new DuplicatedMongodbError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      avatar,
      dob,
    });

    const saveUser = await newUser.save();
    const userResponse = saveUser.toObject();
    delete userResponse.password;
    // Raw dob never leaves the server on signup — only the derived flag.
    delete userResponse.dob;
    userResponse.isAdult = isAdultDob(saveUser.dob);

   return res.status(201).send({ data: userResponse });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Validation failed"));
    }
    if (err.code === 11000) {
      return next(new DuplicatedMongodbError("User already exists"));
    }
    return next(err);
  }
};

// login

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError("Email and password are required"));
  }

  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

   return res.send({ token, isAdult: isAdultDob(user.dob) });
  } catch (err) {
    if (err.message === "Incorrect email or password") {
      return next(new UnauthorizedError(err.message));
    }
    return next(new BadInternalServerError("An error has occured on the server"));
  }
};

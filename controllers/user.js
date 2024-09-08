const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  DuplicatedMongodbError,
  BadInternalServerError
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");

// getCurrentUser

module.exports.getCurrentUser = (req, res, next) => {
  console.log('User objects from middleware:', req.user);
  User.findById(req.user._id )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('No user with matching ID found');
      }
     res.send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("The id is an invalid format"));
      } else {
        next(err);
      }
    });
}
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
    res.send({ data: user });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError("Validation failed"));
    } else {
      next(err);
    }
  }
};

// createUser

module.exports.createUser = async (req, res, next) => {
  const { email, password, name, avatar } = req.body;
  if (!email || !password || !name || !avatar) {
    return res
      .status(BadRequestError)
      .send({ message: "Name, email, password are required" });
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
    });

    const saveUser = await newUser.save();
    const userResponse = saveUser.toObject();
    delete userResponse.password;

   res.status(201).send({ data: userResponse });
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError("Validation failed"));
    } else {
      next(err);
    }
  }
};

// login

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BadRequestError)
      .send({ message: "Email and password are required" });
  }

  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

   res.send({ token });
  } catch (err) {
    if (err.message === "Incorrect email or password") {
      next(new UnauthorizedError(err.message));
    } else {
      next(new BadInternalServerError("An error has occured on ther server"))
    }
  }
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  INVALID_ID,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  MONGODB_DUPLICATE_ERROR,
  UNAUTHORIZED,
} = require("../utils/errors");

const { JWT_SECRET } = require("../utils/config");
const { handleError } = require("../utils/handleError");

// getCurrentUser

module.exports.getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.status(200).send({ data: user });
    })
    .catch(() =>
      res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occured on the server" })
    );
};

// updateCurrentUser

module.exports.updateCurrentUser = async (req, res) => {
  const { name, avatar } = req.body;
  const updateData = { name, avatar };

  try {
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(NOT_FOUND).send({ message: "User not found" });
    }
    return res.send({ data: user });
  } catch (err) {
    return handleError(err, res);
  }
};

// createUser

module.exports.createUser = async (req, res) => {
  const { name, avatar, email, password } = req.body;
  if (!name || !avatar || !email || !password) {
    return res
      .status(INVALID_ID)
      .send({ message: "Name, email, password are required" });
  }
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = MONGODB_DUPLICATE_ERROR;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      avatar,
      email,
      password: hashedPassword,
    });

    const saveUser = await newUser.save();
    const userResponse = saveUser.toObject();
    delete userResponse.password;

    return res.status(201).send({ data: userResponse });
  } catch (err) {
    return handleError(err, res);
  }
};

// login

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(INVALID_ID)
      .send({ message: "Email and password are required" });
  }

  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.send({ token });
  } catch (err) {
    if (err.message === "Incorrect email or password") {
      return res.status(UNAUTHORIZED).send({ message: err.message });
    }
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send({ message: "An error has occured on the server" });
  }
};

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { INVALID_ID, NOT_FOUND, INTERNAL_SERVER_ERROR, MONGODB_DUPLICATE_ERROR, UNAUTHORIZED } = require("../utils/errors");
const { JWT_SECRET } = require('../utils/config');

const handleError = (err, res) => {
  if (err.statusCode === NOT_FOUND ) {
    return res.status(NOT_FOUND).send({ message: err.message });
  }
  if (err.statusCode === MONGODB_DUPLICATE_ERROR || err.code === 11000) {
    return res.status(409).send({ message: 'Eamil already exists' });
  }
  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'An error has occured on the server'});
}
module.exports.getUsers = (req, res) => {
  User.find({})
  .then(users => res.send({ data: users }))
  .catch(() => res.status(INTERNAL_SERVER_ERROR).send({message: 'An error has occured on the server'}));
}

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(INVALID_ID).send({ message: 'Invalid data passed'});
  }
 return  User.findById(userId)
  .orFail(() => {
    const error = new Error('User ID not found');
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then(user => res.status(200).json(user))
  .catch(err => handleError(err, res));
};

module.exports.getCurrentUser = (req, res) => {
    User.findById(req.user._id)
    .then (user => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'User not found'});
      }
      return res.status(200).send({data: user});
    })
   .catch(() =>  res.status(INTERNAL_SERVER_ERROR).send({ message: 'An error has occured on the server'}));
  }

module.exports.updateCurrentUser = (req, res) => {
   const { name, avatar } = req.body;
   User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true, runvalidators: true })
   .then(user => {
    if (!user) {
      return res.status(NOT_FOUND).send({ message: 'User not found'});
    }
    return res.status(200).send({ data: user })
   })
   .catch(err => handleError(err, res));
}

module.exports.createUser = (req,res) => {
  const {name, avatar, email, password} = req.body;
  if (!name || !email || !password) {
    return res.status(INVALID_ID).send({ message: 'Name, email, password are required'});
  }
bcrypt.hash(password, 10)
.then((hashedPassword) => {
  return User.create({name, avatar, email, password: hashedPassword})
})
  .then(user => {
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).send({ data: userResponse })
  })
  .catch(err => {
    console.error('Create user error:', err);
    if (err.name === 'ValidationError') {
      return res.status(INVALID_ID).send({ message: 'Invalid data passed'});
    }
    return handleError(err, res);
  });
}

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(INVALID_ID).send({message: 'Email and password are required'})
  }
 User.findUserByCredentials(email, password)
 .then(user => {
  const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  })
  res.send({token});
 })
.catch(err => {
  console.error('Login error:', err);
    return res.status(UNAUTHORIZED).send({ message: err.message });
    })
}




const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { INVALID_ID, NOT_FOUND, INTERNAL_SERVER_ERROR, MONGODB_DUPLICATE_ERROR } = require("../utils/errors");

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
  .catch(err => {
    if (err.statusCode === NOT_FOUND) {
      return res.status(NOT_FOUND).send({message: 'User not found'});
    }
      return res.status(INTERNAL_SERVER_ERROR).send({message: 'An error has occured on the server'});
});
};
module.exports.createUser = (req,res) => {
  const {name, avatar, email, password} = req.body;
  User.create({name, avatar, email, password})
  .orFail(() => {
    const error = new Error ('item duplicate error');
    error.statusCode = MONGODB_DUPLICATE_ERROR;
    throw error;
      })
  .then(user => res.status(200).send({ data: user }))
  .catch(err => {
    if (err.name === 'ValidationError') {
      return res.status(INVALID_ID).send({ message: 'Invalid data passed'}); }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'An error has occured on the server'});

  });
};

// module.exports.createUser = (req, res) => {
//   const {email, password} = req.body;
//   User.create({email, password})

// }

module.exports.login = (req, res) => {
  const {email, password } = req.body;

  return User.findUserByCredentials(email, password)
  .then((user) => {
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    })
    res.send({token});
  })
  .catch((err) => {
    res
    .status(401)
    .send({message:err.message})
  })
}
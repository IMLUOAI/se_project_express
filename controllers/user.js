const mongoose = require('mongoose');
const User = require('../models/user');
const { INVALID_ID, NOT_FOUND, INTERNAL_SERVER_ERROR } = require("../utils/errors");

module.exports.getUsers = (req, res) => {
  User.find({})
  .then(users => res.send({ data: users }))
  .catch(err => res.status(INTERNAL_SERVER_ERROR).send({message: err.message}));
}
module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(INVALID_ID).send({ message: 'Invalid ID passed'});
  }
  User.findById(userId)
  .orFail(() => {
    const error = new Error('User ID not found');
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then(user => {
    if (!user) {
      return res.status(NOT_FOUND).json({message: 'User not found'});
    }
    res.status(200).json(user);
  })
  .catch(err => {
    console.error(err);
    if (err.name === 'CastError') {
      return res.status(INVALID_ID).send({message: 'Invalid ID passed'});
    }
      res.status(INTERNAL_SERVER_ERROR).send({message: err.message});
});
};
module.exports.createUser = (req,res) => {
  const {name, avatar} = req.body;
  User.create({name, avatar})
  .then(user => res.send({ data: user }))
  .catch((err) => {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(INVALID_ID).send({ message: 'Invalid data passed'}); }
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error'});

  });
};
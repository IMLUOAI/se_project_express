const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
  .then(users => res.send({ data: users}))
  .catch(err => res.status(500).send({message: err.message}));
}
module.exports.getUser = (req, res) => {
  const {userId} = req.params;
  User.findById({userId})
  .then(user => {
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }
    res.status(200).json(user);
  })
  .catch(err => res.status(500).send({message: err.message}));
}
module.exports.createUser = (req,res) => {
  const {name, avatar} = req.body;
  User.create({name, avatar})
  .then(user => res.send({data: user}))
  .catch(err => res.status(500).send({message: err.message}));
};
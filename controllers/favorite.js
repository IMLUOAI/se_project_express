const mongoose = require("mongoose");
const Favorite = require("../models/favorite");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

module.exports.getFavorites = (req, res, next) => {
  Favorite.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .then((favorites) => res.status(200).send(favorites))
    .catch(next);
};

module.exports.createFavorite = (req, res, next) => {
  const { type, url, title } = req.body;
  const owner = req.user._id;

  return Favorite.create({ type, url, title, owner })
    .then((favorite) => res.status(201).send({ data: favorite }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data passed"));
      }
      return next(err);
    });
};

module.exports.deleteFavorite = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid favorite ID"));
  }

  return Favorite.findById(id)
    .orFail(() => {
      throw new NotFoundError("Favorite not found");
    })
    .then((favorite) => {
      if (favorite.owner.toString() !== userId) {
        throw new ForbiddenError("Forbidden");
      }
      return Favorite.findByIdAndRemove(id);
    })
    .then((favorite) => {
      res.status(200).send({ message: "Favorite deleted", data: favorite });
    })
    .catch(next);
};

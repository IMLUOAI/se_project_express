const mongoose = require("mongoose");
const Fit = require("../models/fit");
const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const { parsePagination } = require("../utils/pagination");

// Public shape: owner and items are populated so feed cards can render
// without extra fetches.
const fitPopulate = [
  { path: "owner", select: "_id name avatar" },
  { path: "items", select: "_id name imageUrl weather" },
];

// getFits (public). Query: ?owner=<id>&limit=&page=
module.exports.getFits = (req, res, next) => {
  const { limit, page } = parsePagination(req.query);
  const filter = {};

  if (req.query.owner) {
    if (!mongoose.Types.ObjectId.isValid(req.query.owner)) {
      return next(new BadRequestError("Invalid owner ID"));
    }
    filter.owner = req.query.owner;
  }

  return Fit.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(fitPopulate)
    .then((fits) => res.status(200).json(fits))
    .catch(next);
};

// createFit (auth). Every item must exist and belong to the requester.
module.exports.createFit = async (req, res, next) => {
  const { items = [], weather, note } = req.body;
  const owner = req.user._id;

  try {
    const owned = await ClothingItem.find({ _id: { $in: items }, owner });
    if (owned.length !== items.length) {
      return next(new BadRequestError("One or more items not found or not yours"));
    }

    const fit = await Fit.create({ owner, items, weather, note });
    return res.status(201).send({ data: fit });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed"));
    }
    return next(err);
  }
};

// deleteFit (auth, owner only)
module.exports.deleteFit = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid fit ID"));
  }
  return Fit.findById(id)
    .orFail(() => {
      throw new NotFoundError("Fit not found");
    })
    .then((fit) => {
      if (fit.owner.toString() !== userId) {
        throw new ForbiddenError("Forbidden");
      }
      return Fit.findByIdAndRemove(id);
    })
    .then((fit) => {
      res.status(200).send({ message: "Fit deleted", data: fit });
    })
    .catch((err) => {
      next(err);
    });
};

// likeFit (mirrors likeClothingItem)
module.exports.likeFit = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid fit ID"));
    }

    const fit = await Fit.findByIdAndUpdate(
      id,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).orFail(() => {
      throw new NotFoundError("Fit not found");
    });
    return res.status(200).send({ message: "Fit like was created", data: fit });
  } catch (err) {
    return next(err);
  }
};

// dislikeFit (mirrors dislikeClothingItem)
module.exports.dislikeFit = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid fit ID"));
    }
    const fit = await Fit.findByIdAndUpdate(
      id,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).orFail(() => {
      throw new NotFoundError("Fit not found");
    });
    return res.status(200).send({ message: "Fit like was removed", data: fit });
  } catch (err) {
    return next(err);
  }
};

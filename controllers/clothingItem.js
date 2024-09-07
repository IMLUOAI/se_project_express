const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../utils/errors");

// getClothingItems

module.exports.getClothingItems = (req, res, next) => {
  ClothingItem.find({})
    .then((clothingItems) => res.status(200).json(clothingItems))
    .catch(next);
};

// createClothingItem

module.exports.createClothingItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  if (!name || !weather || !imageUrl) {
    return next(new BadRequestError("name, weather, and imageUrl are required"));
  }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((clothingItem) => res.status(201).send({ data: clothingItem }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data passed"));
      }
      next(err);
    });
};

// getClothingItemById

module.exports.getClothingItemById = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid item ID"));
  }

  return ClothingItem.findById(id)
    .orFail(() => {
      throw new NotFoundError("Item ID not found");
    })
    .then((item) => res.status(200).send({ data: item }))
    .catch(next);
};

// deleteClothingItem

module.exports.deleteClothingItem = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid item ID"));
  }
  return ClothingItem.findById(id)
    .orFail(() => {
      throw  new NotFoundError("Item not found");
    })
    .then((item) => {
      if (item.owner.toString() !== userId) {
        throw new ForbiddenError("Forbidden")
      }
      return ClothingItem.findByIdAndRemove(id);
    })
    .then((item) => {
      res.status(200).send({ message: "Item deleted", data: item });
    })
    .catch((err) => {
      console.error(`Error occurred while deleting item ${id}:`, err)
      next(err);
    });

};

// likeClothingItem

module.exports.likeClothingItem = async (req, res, next) => {
  const { id } = req.params;
try {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid Id"));
  }

  const item = await ClothingItem.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      throw new NotFoundError("Item not found")
    })
      return res.status(200).send({ message: "Item like was created", data: item });
  }
    catch(err) {
      next(err);
    };
};

// dislikeClothingItem

module.exports.dislikeClothingItem = async (req, res, next) => {
  const { id } = req.params;
try {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid item ID"));
  }
  const item = await ClothingItem.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
     .orFail (() => {
      const error = new Error("Item not found");
      error.statusCode = NotFoundError;
      throw new NotFoundError("item not found")
     })
      return res.status(200).send(item);
    }
    catch(err) {
      next(err);
    }
};

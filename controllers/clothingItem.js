const mongoose = require("mongoose");
const ClothingItem = require("../models/clothingItem");
const { INVALID_ID, NOT_FOUND, FORBIDDEN } = require("../utils/errors");
const { handleError } = require("../utils/handleError");

// getClothingItems

module.exports.getClothingItems = (req, res) => {
  ClothingItem.find({})
    .then((clothingItems) => res.status(200).json(clothingItems))
    .catch((err) => handleError(err, res));
};

// createClothingItem

module.exports.createClothingItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  if (!name || !weather || !imageUrl) {
    return res
      .status(INVALID_ID)
      .send({ message: "name, weather, and imageUrl are required" });
  }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((clothingItem) => res.status(201).send({ data: clothingItem }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(INVALID_ID).send({ message: "Invalid data passed" });
      }
      return handleError(err, res);
    });
};

// getClothingItemById

module.exports.getClothingItemById = (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(INVALID_ID).send({ message: "Invalid item ID" });
  }

  return ClothingItem.findById(id)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => handleError(err, res));
};

// deleteClothingItem

module.exports.deleteClothingItem = (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(INVALID_ID).send({ message: "Invalid item ID" });
  }
  return ClothingItem.findById(id)
    .orFail(() => {
      const error = new Error("Item  not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      if (item.owner.toString() !== userId) {
        const error = new Error("Forbidden");
        error.statusCode = FORBIDDEN;
        throw error;
      }
      return ClothingItem.findByIdAndRemove(id);
    })
    .then((item) => {
      res.status(200).send({ message: "Item deleted", data: item });
    })
    .catch((err) => handleError(err, res));
};

// likeClothingItem

module.exports.likeClothingItem = async (req, res) => {
  const { id } = req.params;
try {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(INVALID_ID).send({ message: "Invalid Id" });
  }

  const item = await ClothingItem.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
      return res.status(200).send({ message: "Item like was created", data: item });
  }
    catch(err) {
      return handleError(err, res);
    };
};

// dislikeClothingItem

module.exports.dislikeClothingItem = async (req, res) => {
  const { id } = req.params;
try {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(INVALID_ID).send({ message: "Invalid item ID" });
  }
  const item = await ClothingItem.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
     .orFail (() => {
      const error = new Error("Item not found");
      error.statusCode = NOT_FOUND;
      throw error;
     })
      return res.status(200).send(item);
    }
    catch(err) {
      return handleError(err, res);
    }
};

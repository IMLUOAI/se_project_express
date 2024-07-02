const mongoose = require('mongoose');
const ClothingItem = require('../models/clothingItem');
const { INVALID_ID, NOT_FOUND, INTERNAL_SERVER_ERROR, FORBIDDEN } = require('../utils/errors');
const { handleError } = require('../utils/handleError');




module.exports.getClothingItems = (req, res) => {
    ClothingItem.find({})
  .then(clothingItems => res.status(200).json(clothingItems))
  .catch(err => handleError(err, res));
};


module.exports.createClothingItem = (req, res) => {
  const {name, weather, imageUrl} = req.body;
  const owner = req.user._id;

  if (!name || !weather || !imageUrl) {
    return res.status(INVALID_ID).send({message: 'name, weather, and imageUrl are required'});
  }

  return  ClothingItem.create({name, weather, imageUrl, owner})
  .then(clothingItem => res.status(201).send({data: clothingItem}))
  .catch(err => {
    if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"});
  }
  return handleError(err, res);
  });
};

module.exports.getClothingItemById = (req, res) => {
  const { itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }

  return  ClothingItem.findById(itemId)
  .orFail(() => {
    const error = new Error('Item ID not found');
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then(item => res.status(200).send({ data: item }))
  .catch(err => handleError(err, res));
}
module.exports.deleteClothingItem = (req, res) => {
  const { itemId } = req.params
  const userId = req.user._id;

   if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }
 return  ClothingItem.findByIdAndRemove(itemId)
  .orFail(() => {
    const error = new Error('Item  not found');
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then(item => {
    if (item.owner.toString() !== userId) {
      const error = new Error('Forbidden');
      error.statusCode = FORBIDDEN;
      throw error;
    }
    return ClothingItem.findByIdAndRemove(itemId)
  })
  .then((item)=>
    res.status(200).send(item))
  .catch(err => handleError(err, res));
};

module.exports.likeClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }

  return ClothingItem.findByIdAndUpdate(
  itemId,
  {$addToSet: { likes: req.user._id}},
  {new: true},
)
.orFail(() => {
  const error = new Error('Item not found');
  error.statusCode = NOT_FOUND;
  throw error;
})
.then(item => res.status(200).send(item))
.catch(err => handleError(err, res));
}

module.exports.dislikeClothingItem = (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }
 return  ClothingItem.findByIdAndUpdate(
  itemId,
  {$pull: { likes: req.user._id }},
  {new: true},
)

.then(item => {
  if (!item) {
    return res.status(NOT_FOUND).send({ message: 'Item not found'});
  }
  return res.status(200).send(item)
})
.catch(err => handleError(err, res));
}

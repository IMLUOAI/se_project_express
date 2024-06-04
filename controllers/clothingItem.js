const mongoose = require('mongoose');
const ClothingItem = require('../models/clothingItem');
const {INVALID_ID, NOT_FOUND, INTERNAL_SERVER_ERROR} = require('../utils/errors');

module.exports.getClothingItems = (req, res) => {
    ClothingItem.find({})
  .then(clothingItems => res.status(200).json(clothingItems))
  .catch( err => {
      console.error(`Error fetching clothing items: ${err.message}`);
    res.status(INTERNAL_SERVER_ERROR).send({message: 'Internal server error'});
  });
};


module.exports.createClothingItem = (req, res) => {
 if (!req.user || !req.user._id) {
  return res.status(INVALID_ID).send({message: 'Unauthorized: User ID not found '});
 }
  const {name, weather, imageUrl} = req.body;
  const owner = req.user._id;

  if (!name || !weather || !imageUrl) {
    return res.status(INVALID_ID).send({message: 'name, weather, and imageUrl are required'});
  }


    ClothingItem.create({name, weather, imageUrl, owner})
  .then(clothingItem => res.status(201).send({data: clothingItem}))
  .catch(err => {
    console.error(`Error creating clothing item by ID: ${err.message}`);
    if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"}); }
   res.status(INTERNAL_SERVER_ERROR).send({ message: "Internal server error"});
  });
};

module.exports.getClothingItemById = (req, res) => {
  const { itemId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }


   ClothingItem.findById(itemId)
  .orFail(() => {
    const error = new Error('Item ID not found');
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then(item => res.status(200).send({ data: item }))
  .catch(err => {
    console.error(`Error fetching clothing item by ID: ${err.message}`);
    if (err.statusCode === NOT_FOUND) {
      return res.status(NOT_FOUND).send({ message: err.message});
    }
    res.status(INTERNAL_SERVER_ERROR).send({message: 'Internal server error'});
  })
}
module.exports.deleteClothingItem = (req, res) => {
  const { itemId } =req.params

   if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }

  ClothingItem.findByIdAndRemove(itemId)
  .orFail(() => {
    const error = new Error('Item  not found');
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then((item)=>
    res.status(200).send(item))
  .catch((err) => {
    console.error(`Error deleting clothing item: ${err.message}`);
    if (err.statusCode === NOT_FOUND ) {
      return res.status(NOT_FOUND).send({message: 'Item not found'});
    }
    if (err.name === 'ValidationError') {
      return res.status(INVALID_ID).send({ message: "Invalid data passed"});
  }
    res.status(INTERNAL_SERVER_ERROR).send({message: 'Internal server error'})
  });
};

module.exports.likeClothingItem = (req, res) => {
  const itemId = req.params.itemId;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    console.error(`Invalid item ID: ${itemId}`);
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }

  ClothingItem.findByIdAndUpdate(
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
.catch((err) => {
  console.error(`Error liking clothing item: ${err.message}`);
  if (err.statusCode === NOT_FOUND ) {
    return res.status(NOT_FOUND).send({ message: "Item not found"});
  }
  if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"});
}
  res.status(INTERNAL_SERVER_ERROR).send({message: 'internal server error '});
});
}

module.exports.dislikeClothingItem = (req, res) => {
  const itemId = req.params.itemId;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    console.error(`Invalid item ID: ${itemId}`);
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }
  ClothingItem.findByIdAndUpdate(
  itemId,
  {$pull: {likes: req.user._id}},
  {new: true},
)
.then(item => res.send(item))
.catch((err) => {
  console.error(`Error disliking clothing item: ${err.message}`);

  if (err.statusCode === NOT_FOUND ) {
    return res.status(NOT_FOUND).send({ message: "Item not found"});
  }
  if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"});
  }
  res.status(INTERNAL_SERVER_ERROR).send({message: 'internal server error '});
});
}

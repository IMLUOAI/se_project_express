const mongoose = require('mongoose');
const ClothingItem = require('../models/clothingItem');
const {INVALID_ID, NOT_FOUND, INTERNET_SERVER_ERROR} = require('../utils/errors');

module.exports.getClothingItems = (req, res) => {
    ClothingItem.find({})
  .then(clothingItems => res.status(200).json(clothingItems))
  .catch( err => {
      console.error(`Error fetching clothing items: ${err.message}`);
    res.status(INTERNET_SERVER_ERROR).send({message: 'Internet server errors'});
  });
};

module.exports.createClothingItem = (req, res) => {
 if (!req.user || !req.user._id) {
  return res.status(401).send({message: 'Unauthorized: User ID not found'});
 }
  const {name, weather, imageUrl} = req.body;
  const owner = req.user._id;

  if (!name || typeof name !== 'string' || name.length < 2 || name.length > 30) {
    return res.status(400).send({message: 'Invalid name field'})
  }
  if (!weather || typeof weather !== 'string' ) {
    return res.status(400).send({message: 'Invalid weather field'})
  }
  if (!imageUrl || !isValidUrl(imageUrl)) {
    return res.status(400).send({message: 'Invalid imageUrl field'})
  }

    ClothingItem.create({name, weather, imageUrl, owner})
  .then(clothingItem => res.status(201).send({data: clothingItem}))
  .catch(err => {
    console.error('Error with the message ${err.message} has occured while executing the code');
    if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"}); }
   res.status(INTERNET_SERVER_ERROR).send({ message: "Internal server error"});
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
  .then(item => res.send({ data: item }))
  .catch(err => {
    console.error(`Error fetching clothing item by ID: ${err.message}`);
    if (err.statusCode === NOT_FOUND) {
      return res.status(NOT_FOUND).send({ message: err.message});
    }
    res.status(INTERNET_SERVER_ERROR).send({message: 'Internal server error'});
  })
}
module.exports.deleteClothingItem = (req, res) => {
  const { itemId } =req.params
  ClothingItem.findByIdAndRemove(itemId)
  .orFail()
  .then( (item)=> {
    if (!item) {
      return res.status(NOT_FOUND).json({
        message: 'Item not found'
      });
    }
    res.send(item);
  })
  .catch((err) => {
    console.error(`Error deleting clothing item: ${err.message}`);
    if (err.name === 'ValidationError') {
      return res.status(INVALID_ID).send({ message: "Invalid data passed"});
  }
    res.status(INTERNET_SERVER_ERROR).send({message: 'Internal server error'})
  });
};

module.exports.likeClothingItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
  req.params.itemId,
  {$addToSet: { likes: req.user._id}},
  {new: true},
)
.then(item => res.send(item))
.catch((err) => {
  console.error(`Error liking clothing item: ${err.message}`);
  if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"});
  }
  res.status(INTERNET_SERVER_ERROR).send({message: 'internal server error '});
});
}

module.exports.dislikeClothingItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
  req.params.itemId,
  {$pull: {likes: req.user._id}},
  {new: true},
)
.then(item => res.send(item))
.catch((err) => {
  console.error(`Error disliking clothing item: ${err.message}`);
  if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"});
  }
  res.status(INTERNET_SERVER_ERROR).send({message: 'internal server error '});
});
}

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
}
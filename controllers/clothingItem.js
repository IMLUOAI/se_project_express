const mongoose = require('mongoose');
const ClothingItem = require('../models/clothingItem');
const {INVALID_ID, NOT_FOUND, INTERNET_SERVER_ERROR} = require('../utils/errors');

module.exports.getClothingItems = (req, res) => {
  ClothingItem.find({})
  .then(clothingItems => res.status(200).json(clothingItems))
  .catch( err => res.status(INTERNET_SERVER_ERROR).send({message: 'Internet server errors'}));
};

module.exports.createClothingItem = (req, res) => {
 if (!req.user || !req.user_id) {
  return res.status(401).send({message: 'Unauthorized: User ID not found'});
 }
  const {name, weather, imageUrl} = req.body;
  const owner = req.user._id;
  ClothingItem.create({name, weather, imageUrl, owner})
  .then(clothingItem => res.send({data: clothingItem}))
  .catch(err => {
    if (err.name === 'ValidationError') {
    return res.status(INVALID_ID).send({ message: "Invalid data passed"}); }
    console.error('Error with the message ${err.message} has occured while executing the code');
   res.status(INTERNET_SERVER_ERROR).send({ message: "Internal server error"});});
};

module.exports.getClothingItemById = (req, res) => {
  const {itemId} = req.params;
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(INVALID_ID).send({message: 'Invalid item ID'});
  }
  ClothingItem.findById(itemId)
  .orFail(() => {
    const error = new Error("Item ID not found");
    error.statusCode = NOT_FOUND;
    throw error;
  })
  .then(item => res.send({ data: item}))
  .catch(err => {
    console.error('Error ${err.name} with the message ${err.message} has occured while executing the code ');
    if (err.statusCode === NOT_FOUND) {
      return res.status(NOT_FOUND).send({ message: err.message});
    }
    res.status(INTERNET_SERVER_ERROR).send({message: 'Internal server error'})
  })
}
module.exports.deleteClothingItem = (req, res) => {
  const { itemId } =req.params
  ClothingItem.findByIdAndRemove(itemId)
  .orFail()
  .then( (item)=> {
    if (!item) {
      return res.status(NOT_FOUND).json({
        message: "Item not found"
      });
    }
    res.send(item);
  })
  .catch((error) => {
    console.error(`Error ${err.name} with the message ${err.message} has occurred while executing the code`);
  });
};

module.exports.likeClothingItem = (req, res) => ClothingItem.findByIdAndUpdate(
  req.params.itemId,
  {$addToSet: { likes: req.user._id}},
  {new: true},
)

module.exports.dislikeClothingItem = (req, res) => ClothingItem.findByIdAndUpdate(
  req.params.itemId,
  {$pull: {likes: req.user._id}},
  {new: true},
)
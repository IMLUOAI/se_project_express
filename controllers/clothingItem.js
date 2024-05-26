
const ClothingItem = require('../models/clothingItem');

module.exports.getClothingItems = (req, res) => {
  ClothingItem.find({})
  .then(clothingItems => res.send( {data: clothingItems}))
  .catch( err => res.status(500).send({message: err.message}));
};

module.exports.createClothingItem = (req, res) => {
  const {name, imageUrl, owner, likes, createAt, validate} = req.body;
  ClothingItem.create({name, imageUrl, owner, likes, createAt, validate})
  .then(clothingItem => res.send({ data: clothingItem}))
  .catch(err => res.status(500).send({message: err.message}));
};

module.exports.deleteClothingItem = (req, res) => {
  const { clothingItemId } =req.body
  ClothingItem.findByIdAndDelete({clothingItemId})
  .then(clothingItemId => res.send({ data: clothingItemId}))
  .catch(err => res.status(500).send({message: err.message}));
}
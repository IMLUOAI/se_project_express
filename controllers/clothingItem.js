
const ClothingItem = require('../models/clothingItem');

module.exports.getClothingItems = (req, res) => {
  ClothingItem.find({})
  .then(items => res.status(200).json(items))
  .catch( err => res.status(500).send({message: err.message}));
};

module.exports.createClothingItem = (req, res) => {
  console.log(req.user._id);
  const {name, imageUrl, owner, likes, createAt} = req.body;
  ClothingItem.create({name, imageUrl, owner, likes, createAt})
  .then(item => res.status(200).json(item))
  .catch(err => res.status(500).send({message: err.message}));
};

module.exports.deleteClothingItem = (req, res) => {
  const { itemId } =req.params
  ClothingItem.findByIdAndRemove(itemId)
  .then( item => {
    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }
    res.status(200).json({ message: "Item deleted"});
  })
  .catch(err => res.status(500).send({message: err.message}));
}

module.exports.likeItem = (req, res) => ClothingItem.findByIdAndUpdate(
  req.params.itemId,
  {$addToSet: { likes: req.user._id}},
  {new: true},
)

module.exports.dislikeItem = (req, res) => ClothingItem.findByIdAndUpdate(
  req.params.itemId,
  {$pull: {likes: req.user._id}},
  {new: true},
)
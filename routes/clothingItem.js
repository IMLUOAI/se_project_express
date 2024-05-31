const router = require('express').Router();
const {getClothingItems, createClothingItem, deleteClothingItem, likeClothingItem, dislikeClothingItem} = require('../controllers/clothingItem');


router.get('/', getClothingItems);
router.delete('/:itemId', deleteClothingItem);
router.put('/items/:itemId/likes', likeClothingItem);
router.delete('/items/:itemId/likes', dislikeClothingItem);
router.post('/', createClothingItem);


router.use ((req, res) => {
  res.status(404).json({
    message: "Requested resource not found"
  })
})
module.exports = router;

const router = require('express').Router();
const { getClothingItems, getClothingItemById, createClothingItem, deleteClothingItem, likeClothingItem, dislikeClothingItem } = require('../controllers/clothingItem');

router.get('/', getClothingItems);
router.post('/', createClothingItem);
router.get('/:id', getClothingItemById )
router.delete('/:id', deleteClothingItem);
router.put('/:id/likes', likeClothingItem);
router.delete('/:id/likes', dislikeClothingItem);


module.exports = router;

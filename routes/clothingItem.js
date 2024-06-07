const router = require('express').Router();
const {getClothingItems, getClothingItemById, createClothingItem, deleteClothingItem, likeClothingItem, dislikeClothingItem} = require('../controllers/clothingItem');
const { NOT_FOUND } = require('../utils/errors');


router.get('/', getClothingItems);
router.get('/:itemId', getClothingItemById )
router.delete('/:itemId', deleteClothingItem);
router.put('/:itemId/likes', likeClothingItem);
router.delete('/:itemId/likes', dislikeClothingItem);
router.post('/', createClothingItem);


module.exports = router;

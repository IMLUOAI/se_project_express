const router = require('express').Router();
const { getClothingItems, getClothingItemById, createClothingItem, deleteClothingItem, likeClothingItem, dislikeClothingItem } = require('../controllers/clothingItem');
const auth = require('../middlewares/auth');

router.get('/', getClothingItems);
router.post('/', auth, createClothingItem);
router.get('/:id', auth, getClothingItemById )
router.delete('/:id', auth,  deleteClothingItem);
router.put('/:id/likes', auth, likeClothingItem);
router.delete('/:id/likes', auth, dislikeClothingItem);


module.exports = router;

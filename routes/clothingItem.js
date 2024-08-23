const router = require('express').Router();
const { getClothingItems, getClothingItemById, createClothingItem, deleteClothingItem, likeClothingItem, dislikeClothingItem } = require('../controllers/clothingItem');
const auth = require('../middlewares/auth');
const { validateClothingItem, validateId } = require('../middlewares/validation');



router.get('/', getClothingItems);
router.post('/',  auth, validateClothingItem, createClothingItem);
router.get('/:id',  auth, validateId, getClothingItemById )
router.delete('/:id', auth, validateId, deleteClothingItem);
router.put('/:id/likes', auth, validateId, likeClothingItem);
router.delete('/:id/likes', auth, validateId, dislikeClothingItem);


module.exports = router;

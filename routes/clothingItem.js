const router = require('express').Router();
const {getClothingItems, createClothingItem, deleteClothingItem} = require('../controllers/clothingItem');


router.get('/', getClothingItems);
router.delete('/:clothingItemId', deleteClothingItem);

router.post('/', createClothingItem);


router.use ((req, res) => {
  res.status(404).json({
    message: "Requested resource not found"
  })
})
module.exports = router;

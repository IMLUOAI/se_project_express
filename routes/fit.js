const router = require('express').Router();
const { getFits, createFit, deleteFit, likeFit, dislikeFit } = require('../controllers/fit');
const auth = require('../middlewares/auth');
const { validateFit, validateId } = require('../middlewares/validation');



router.get('/', getFits);
router.post('/', auth, validateFit, createFit);
router.delete('/:id', auth, validateId, deleteFit);
router.put('/:id/likes', auth, validateId, likeFit);
router.delete('/:id/likes', auth, validateId, dislikeFit);



module.exports = router;

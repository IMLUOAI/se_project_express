const router = require('express').Router();
const { getBattles, createBattle, voteBattle, closeBattle } = require('../controllers/battle');
const auth = require('../middlewares/auth');
const { validateBattle, validateVote, validateId } = require('../middlewares/validation');



router.get('/', getBattles);
router.post('/', auth, validateBattle, createBattle);
router.post('/:id/vote', auth, validateId, validateVote, voteBattle);
router.post('/:id/close', auth, validateId, closeBattle);



module.exports = router;

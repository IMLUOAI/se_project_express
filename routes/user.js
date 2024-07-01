const router = require('express').Router();
const { getCurrentUser, updateCurrentUser, login, createUser } = require('../controllers/user');
const auth = require('../middlewares/auth');


router.get('/me', auth, getCurrentUser);
router.patch('/me', auth,  updateCurrentUser)
router.post('/signin', login);
router.post('/signup', createUser);

module.exports = router;
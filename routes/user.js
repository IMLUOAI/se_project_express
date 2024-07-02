const router = require('express').Router();
const { getCurrentUser, updateCurrentUser, login, createUser } = require('../controllers/user');


router.get('/me', getCurrentUser);
router.patch('/me', updateCurrentUser);
router.post('/signin', login);
router.post('/signup', createUser);

module.exports = router;
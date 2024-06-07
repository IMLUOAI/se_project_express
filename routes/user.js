const router = require('express').Router();
const {getUsers, getUser, createUser} = require('../controllers/user');
const { NOT_FOUND } = require('../utils/errors');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.post('/', createUser);


module.exports = router;
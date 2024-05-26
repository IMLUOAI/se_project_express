const router = require('express').Router();
const {getUsers, createUser} = require('../controllers/user');
router.get('/', getUsers);
router.get('/:userId', getUsers)
router.post('/', createUser);

router.use((req, res) => {
  res.status(404).json({'message': 'Requested resource not found'
});
});
module.exports = router;
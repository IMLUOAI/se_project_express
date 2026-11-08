const router = require('express').Router();
const { getPosts, createPost, deletePost, likePost, dislikePost } = require('../controllers/post');
const auth = require('../middlewares/auth');
const { validatePost, validateId } = require('../middlewares/validation');

router.get('/', getPosts);
router.post('/', auth, validatePost, createPost);
router.delete('/:id', auth, validateId, deletePost);
router.put('/:id/likes', auth, validateId, likePost);
router.delete('/:id/likes', auth, validateId, dislikePost);

module.exports = router;

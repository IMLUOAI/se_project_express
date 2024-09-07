const router = require("express").Router();
const { getCurrentUser, updateCurrentUser } = require("../controllers/user");
const { validateUpdateProfile } = require('../middlewares/validation');


router.get('/me',  getCurrentUser);
router.patch('/me', validateUpdateProfile, updateCurrentUser);

module.exports = router;

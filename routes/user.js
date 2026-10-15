const router = require("express").Router();
const { getCurrentUser, updateCurrentUser, updateDob } = require("../controllers/user");
const { validateUpdateProfile, validateDobUpdate } = require('../middlewares/validation');


router.get('/me',  getCurrentUser);
router.patch('/me', validateUpdateProfile, updateCurrentUser);
router.patch('/me/dob', validateDobUpdate, updateDob);

module.exports = router;

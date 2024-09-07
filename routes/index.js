const router = require("express").Router();
const { createUser, login } = require("../controllers/user");
const auth = require("../middlewares/auth");
const { validateUserCreation, validateLogin } = require('../middlewares/validation');



router.post("/signin", validateLogin, login);
router.post("/signup", validateUserCreation, createUser);

router.use("/users", auth, require("./user"));
router.use("/items", auth, require("./clothingItem"));

module.exports = router;

const router = require("express").Router();
const { createUser, login } = require("../controllers/user");
const NotFoundError = require("../errors/NotFoundError");
const auth = require("../middlewares/auth");
const { validateUserCreation, validateLogin } = require('../middlewares/validation');


router.post("/signin", validateLogin, login);
router.post("/signup", validateUserCreation, createUser);

router.use("/users", auth, require("./user"));
router.use("/items",  require("./clothingItem"));
router.use("/favorites", auth, require("./favorite"));
router.use("/gallery", auth, require("./galleryItem"));

router.use((req, res, next) => {
  next(new NotFoundError('The route you are trying to access does not exist'));
})

module.exports = router;

const router = require("express").Router();
const { createUser, login, getPublicUser } = require("../controllers/user");
const NotFoundError = require("../errors/NotFoundError");
const auth = require("../middlewares/auth");
const { validateUserCreation, validateLogin, validateId } = require('../middlewares/validation');


router.post("/signin", validateLogin, login);
router.post("/signup", validateUserCreation, createUser);

// Public profile card — must be registered BEFORE the auth-guarded /users
// router below, and carries no auth middleware of its own.
router.get("/users/:id/public", validateId, getPublicUser);

router.use("/users", auth, require("./user"));
router.use("/items",  require("./clothingItem"));
router.use("/favorites", auth, require("./favorite"));
router.use("/gallery", auth, require("./galleryItem"));
router.use("/fits", require("./fit"));
router.use("/battles", require("./battle"));

router.use((req, res, next) => {
  next(new NotFoundError('The route you are trying to access does not exist'));
})

module.exports = router;

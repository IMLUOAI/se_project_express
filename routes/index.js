const router = require("express").Router();
const { createUser, login } = require("../controllers/user");
const auth = require("../middlewares/auth");

router.post("/signin", login);
router.post("/signup", createUser);

router.use("/users", auth, require("./user"));
router.use("/items", require("./clothingItem"));

module.exports = router;

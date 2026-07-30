const router = require("express").Router();
const {
  getFavorites,
  createFavorite,
  deleteFavorite,
} = require("../controllers/favorite");
const { validateFavorite, validateId } = require("../middlewares/validation");

router.get("/", getFavorites);
router.post("/", validateFavorite, createFavorite);
router.delete("/:id", validateId, deleteFavorite);

module.exports = router;

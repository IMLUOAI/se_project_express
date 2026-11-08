const router = require("express").Router();
const { getComments, addComment, deleteComment } = require("../controllers/comment");
const auth = require("../middlewares/auth");
const {
  validateComment,
  validateCommentList,
  validateId,
} = require("../middlewares/validation");

router.get("/", validateCommentList, getComments);
router.post("/", auth, validateComment, addComment);
router.delete("/:id", auth, validateId, deleteComment);

module.exports = router;

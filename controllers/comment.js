const mongoose = require("mongoose");
const Comment = require("../models/comment");
const Fit = require("../models/fit");
const Post = require("../models/post");
const GalleryItem = require("../models/galleryItem");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const { parsePagination } = require("../utils/pagination");

// Public shape: the author is populated so comment rows can render
// without extra fetches.
const commentPopulate = [{ path: "author", select: "_id name avatar" }];

// Resolve the thing being commented on (a fit, a shelf post, or an album
// photo) so delete rights and the comment counter can be checked against
// its owner.
async function findTarget(targetType, targetId) {
  if (targetType === "fit") return Fit.findById(targetId);
  if (targetType === "gallery") return GalleryItem.findById(targetId);
  return Post.findById(targetId);
}

function modelFor(targetType) {
  if (targetType === "fit") return Fit;
  if (targetType === "gallery") return GalleryItem;
  return Post;
}

async function bumpCount(targetType, targetId, delta) {
  const Model = modelFor(targetType);
  const filter = { _id: targetId };
  if (delta < 0) filter.commentCount = { $gt: 0 };
  await Model.findOneAndUpdate(filter, { $inc: { commentCount: delta } });
}

// getComments (public). Query: ?targetType=fit|post|gallery&targetId=<id>&limit=&page=
// Oldest first — a comment thread reads top to bottom.
module.exports.getComments = (req, res, next) => {
  const { targetType, targetId } = req.query;
  const { limit, page } = parsePagination(req.query);
  if (targetType !== "fit" && targetType !== "post" && targetType !== "gallery") {
    return next(new BadRequestError("targetType must be fit, post or gallery"));
  }
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return next(new BadRequestError("Invalid target ID"));
  }
  return Comment.find({ targetType, targetId })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(commentPopulate)
    .then((comments) => res.status(200).json(comments))
    .catch(next);
};

// addComment (auth). Body: { targetType, targetId, text }
module.exports.addComment = async (req, res, next) => {
  const { targetType, targetId, text } = req.body;
  try {
    const target = await findTarget(targetType, targetId);
    if (!target) return next(new NotFoundError("Nothing to comment on"));
    const comment = await Comment.create({
      targetType,
      targetId,
      author: req.user._id,
      text,
    });
    await bumpCount(targetType, targetId, 1);
    const populated = await comment.populate(commentPopulate);
    return res.status(201).send({ data: populated });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed"));
    }
    return next(err);
  }
};

// deleteComment (auth). The comment's author, or the owner of the thing
// commented on, can remove it.
module.exports.deleteComment = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid comment ID"));
    }
    const comment = await Comment.findById(id).orFail(() => {
      throw new NotFoundError("Comment not found");
    });
    const target = await findTarget(comment.targetType, comment.targetId);
    const isAuthor = comment.author.toString() === userId;
    const isTargetOwner = target && target.owner.toString() === userId;
    if (!isAuthor && !isTargetOwner) throw new ForbiddenError("Forbidden");
    await Comment.findByIdAndRemove(id);
    await bumpCount(comment.targetType, comment.targetId, -1);
    return res.status(200).send({ message: "Comment deleted" });
  } catch (err) {
    return next(err);
  }
};

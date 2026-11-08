const mongoose = require("mongoose");
const Post = require("../models/post");
const Comment = require("../models/comment");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");
const { parsePagination } = require("../utils/pagination");

// Public shape: owner is populated so post cards can render without extra
// fetches.
const postPopulate = [{ path: "owner", select: "_id name avatar" }];

// getPosts (public). Query: ?owner=<id>&limit=&page=
module.exports.getPosts = (req, res, next) => {
  const { limit, page } = parsePagination(req.query);
  const filter = {};

  if (req.query.owner) {
    if (!mongoose.Types.ObjectId.isValid(req.query.owner)) {
      return next(new BadRequestError("Invalid owner ID"));
    }
    filter.owner = req.query.owner;
  }

  return Post.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(postPopulate)
    .then((posts) => res.status(200).json(posts))
    .catch(next);
};

// createPost (auth). A shelf share: a snapshot of a book / song / other
// from the user's shelf, with an optional note.
module.exports.createPost = async (req, res, next) => {
  const { shelfType, title, creator, coverUrl, url, note } = req.body;
  try {
    const post = await Post.create({
      owner: req.user._id,
      kind: "shelf",
      shelfType,
      title,
      creator,
      coverUrl,
      url,
      note,
    });
    return res.status(201).send({ data: post });
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data passed"));
    }
    return next(err);
  }
};

// deletePost (auth, owner only) — also removes its comments.
module.exports.deletePost = (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new BadRequestError("Invalid post ID"));
  }
  return Post.findById(id)
    .orFail(() => {
      throw new NotFoundError("Post not found");
    })
    .then((post) => {
      if (post.owner.toString() !== userId) {
        throw new ForbiddenError("Forbidden");
      }
      return Post.findByIdAndRemove(id);
    })
    .then((post) => Comment.deleteMany({ targetType: "post", targetId: id }).then(() => post))
    .then((post) => {
      res.status(200).send({ message: "Post deleted", data: post });
    })
    .catch((err) => {
      next(err);
    });
};

// likePost (mirrors likeFit)
module.exports.likePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid post ID"));
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    ).orFail(() => {
      throw new NotFoundError("Post not found");
    });
    return res.status(200).send({ message: "Post like was created", data: post });
  } catch (err) {
    return next(err);
  }
};

// dislikePost (mirrors dislikeFit)
module.exports.dislikePost = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new BadRequestError("Invalid post ID"));
    }
    const post = await Post.findByIdAndUpdate(
      id,
      { $pull: { likes: req.user._id } },
      { new: true }
    ).orFail(() => {
      throw new NotFoundError("Post not found");
    });
    return res.status(200).send({ message: "Post like was removed", data: post });
  } catch (err) {
    return next(err);
  }
};
